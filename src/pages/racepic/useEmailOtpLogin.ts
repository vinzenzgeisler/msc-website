import { useCallback, useState } from 'react';
import { CognitoAuthError, confirmEmailOtp, startEmailOtpSignIn, type EmailOtpChallenge } from '@/integrations/racepic/photographerAuth';
import { savePhotographerSession } from '@/integrations/racepic/session';

/**
 * Gemeinsame Email-OTP-Loginlogik fuer StudioInvitationPage und StudioLoginPage (Paket 2b).
 * Passkeys (WEB_AUTHN) sind hier bewusst noch nicht abgebildet, siehe photographerAuth.ts.
 */
export type EmailOtpStep = 'enter-email' | 'enter-code' | 'done';

const cognitoErrorMessage = (error: unknown): string => {
  if (error instanceof CognitoAuthError) {
    if (error.cognitoErrorType === 'UserNotFoundException') {
      return 'Zu dieser E-Mail-Adresse existiert noch kein RacePic-Fotografenkonto.';
    }
    if (error.cognitoErrorType === 'CodeMismatchException') {
      return 'Der Code ist nicht korrekt.';
    }
    if (error.cognitoErrorType === 'ExpiredCodeException') {
      return 'Der Code ist abgelaufen. Bitte fordere einen neuen an.';
    }
    if (error.cognitoErrorType === 'TooManyRequestsException' || error.cognitoErrorType === 'LimitExceededException') {
      return 'Zu viele Versuche. Bitte versuche es in ein paar Minuten erneut.';
    }
  }
  return 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.';
};

export function useEmailOtpLogin() {
  const [step, setStep] = useState<EmailOtpStep>('enter-email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<EmailOtpChallenge | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCode = useCallback(async (emailValue: string) => {
    setPending(true);
    setError(null);
    try {
      const nextChallenge = await startEmailOtpSignIn(emailValue);
      setChallenge(nextChallenge);
      setEmail(emailValue);
      setStep('enter-code');
    } catch (err) {
      setError(cognitoErrorMessage(err));
    } finally {
      setPending(false);
    }
  }, []);

  const confirmCode = useCallback(
    async (codeValue: string): Promise<boolean> => {
      if (!challenge) return false;
      setPending(true);
      setError(null);
      try {
        const tokens = await confirmEmailOtp(challenge, codeValue);
        savePhotographerSession(tokens);
        setStep('done');
        return true;
      } catch (err) {
        setError(cognitoErrorMessage(err));
        return false;
      } finally {
        setPending(false);
      }
    },
    [challenge]
  );

  return { step, email, code, setCode, pending, error, requestCode, confirmCode };
}

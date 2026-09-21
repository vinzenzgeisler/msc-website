// Passwordless-Login gegen den RacePic-Fotografen-Cognito-Pool (Email-OTP), siehe
// docs/memory-bank/racepic-architecture.md Abschnitt E. Bewusst per direktem `fetch` gegen die
// unauthentifizierte Cognito-IdP-API (InitiateAuth/RespondToAuthChallenge brauchen keine
// SigV4-Signatur bei einem App-Client ohne Secret) statt des vollen `@aws-sdk/client-cognito-*`-
// oder Amplify-Auth-Pakets - spart mehrere hundert KB Bundle-Groesse auf einer Marketing-Website
// (siehe Lighthouse-Ziel im Architekturplan). Passkeys (WEB_AUTHN) folgen in einem spaeteren
// Schritt; dieser Client deckt vorerst nur den Email-OTP-Pfad ab, der fuer Einladung/Claim reicht.

const region = (import.meta.env.VITE_RACEPIC_AWS_REGION || 'eu-central-1').trim();
const clientId = (import.meta.env.VITE_RACEPIC_PHOTOGRAPHER_CLIENT_ID || '').trim();

export const isPhotographerAuthConfigured = (): boolean => clientId.length > 0;

class CognitoAuthError extends Error {
  constructor(
    public readonly cognitoErrorType: string,
    message: string
  ) {
    super(message);
  }
}

async function cognitoRequest<T>(target: string, body: Record<string, unknown>): Promise<T> {
  if (!isPhotographerAuthConfigured()) {
    throw new CognitoAuthError('NotConfigured', 'RACEPIC_PHOTOGRAPHER_AUTH_NOT_CONFIGURED');
  }
  const response = await fetch(`https://cognito-idp.${region}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-amz-json-1.1',
      'x-amz-target': `AWSCognitoIdentityProviderService.${target}`
    },
    body: JSON.stringify(body)
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const type = typeof payload.__type === 'string' ? payload.__type.split('#').pop()! : 'UnknownError';
    const message = typeof payload.message === 'string' ? payload.message : type;
    throw new CognitoAuthError(type, message);
  }
  return payload as T;
}

export { CognitoAuthError };

type InitiateAuthResponse = {
  ChallengeName?: string;
  Session?: string;
  AuthenticationResult?: {
    AccessToken: string;
    IdToken: string;
    RefreshToken?: string;
    ExpiresIn: number;
  };
};

export type EmailOtpChallenge = { email: string; session: string };

/**
 * Startet den Email-OTP-Login. Der Cognito-Nutzer muss vorher existieren (siehe
 * `ensurePhotographerCognitoUser` im Backend, aufgerufen beim Einladen bzw. bei
 * `/public/racepic/invitations/{token}/start`), sonst schlaegt dieser Aufruf mit
 * `UserNotFoundException` fehl.
 */
export const startEmailOtpSignIn = async (email: string): Promise<EmailOtpChallenge> => {
  const result = await cognitoRequest<InitiateAuthResponse>('InitiateAuth', {
    AuthFlow: 'USER_AUTH',
    ClientId: clientId,
    AuthParameters: {
      USERNAME: email.trim().toLowerCase(),
      PREFERRED_CHALLENGE: 'EMAIL_OTP'
    }
  });
  if (result.ChallengeName !== 'EMAIL_OTP' || !result.Session) {
    throw new CognitoAuthError('UnexpectedChallenge', `Unexpected Cognito response: ${result.ChallengeName ?? 'none'}`);
  }
  return { email, session: result.Session };
};

export type PhotographerTokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string | null;
  expiresAt: number;
};

/** Bestaetigt den per E-Mail zugestellten Code und schliesst den Login ab. */
export const confirmEmailOtp = async (challenge: EmailOtpChallenge, code: string): Promise<PhotographerTokens> => {
  const result = await cognitoRequest<InitiateAuthResponse>('RespondToAuthChallenge', {
    ChallengeName: 'EMAIL_OTP',
    ClientId: clientId,
    Session: challenge.session,
    ChallengeResponses: {
      USERNAME: challenge.email.trim().toLowerCase(),
      EMAIL_OTP_CODE: code.trim()
    }
  });
  if (!result.AuthenticationResult) {
    throw new CognitoAuthError('IncompleteChallenge', 'Login did not complete - a further challenge may be required');
  }
  const { AccessToken, IdToken, RefreshToken, ExpiresIn } = result.AuthenticationResult;
  return {
    accessToken: AccessToken,
    idToken: IdToken,
    refreshToken: RefreshToken ?? null,
    expiresAt: Date.now() + ExpiresIn * 1000
  };
};

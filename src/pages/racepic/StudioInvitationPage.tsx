import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { claimInvitation, fetchInvitationPreview, fetchRacePicConfig, startInvitation, type InvitationPreview } from '@/integrations/racepic/client';
import { useEmailOtpLogin } from './useEmailOtpLogin';

type LoadState = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'ready'; preview: InvitationPreview };

/**
 * Einmalige Aktivierung eines Fotografenprofils ueber den Einladungslink (Paket 2b). Der Link
 * selbst gewaehrt keinen Zugriff, er startet nur den Email-OTP-Login fuer die eingeladene Adresse
 * (siehe docs/memory-bank/racepic-architecture.md Abschnitt E "Einladung, Claiming, Session").
 */
export default function StudioInvitationPage() {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const { step, pending, error, requestCode, confirmCode } = useEmailOtpLogin();
  const [codeInput, setCodeInput] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchInvitationPreview(token)
      .then((preview) => {
        if (!cancelled) setState({ kind: 'ready', preview });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: 'error', message: 'Diese Einladung wurde nicht gefunden oder ist nicht mehr gültig.' });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleConfirmEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (state.kind !== 'ready') return;
    try {
      const { email } = await startInvitation(token);
      await requestCode(email);
    } catch {
      setClaimError('Die Einladung konnte nicht gestartet werden. Bitte lade die Seite neu und versuche es erneut.');
    }
  };

  const handleCodeSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await confirmCode(codeInput);
    if (!ok) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const config = await fetchRacePicConfig();
      await claimInvitation(token, config.photographerTermsVersion);
      navigate('/racepic/studio');
    } catch {
      setClaimError('Die Einladung konnte nicht abgeschlossen werden. Bitte versuche es erneut oder kontaktiere den MSC.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <MainLayout title="RacePic Studio – Einladung" noindex>
      <section className="container flex min-h-[60vh] max-w-md flex-col justify-center py-16">
        <h1 className="font-heading text-3xl font-black uppercase tracking-tight">RacePic Studio</h1>

        {state.kind === 'loading' && <Loader2 className="mt-8 h-8 w-8 animate-spin text-accent" />}

        {state.kind === 'error' && (
          <div className="mt-8 flex items-start gap-3">
            <XCircle className="h-6 w-6 shrink-0 text-destructive" />
            <p className="text-muted-foreground">{state.message}</p>
          </div>
        )}

        {state.kind === 'ready' && state.preview.consumed && (
          <div className="mt-8 flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
            <p className="text-muted-foreground">
              Diese Einladung wurde bereits verwendet. Melde dich stattdessen unter{' '}
              <a href="/racepic/studio/login" className="underline">
                racepic/studio/login
              </a>{' '}
              an.
            </p>
          </div>
        )}

        {state.kind === 'ready' && state.preview.expired && !state.preview.consumed && (
          <div className="mt-8 flex items-start gap-3">
            <XCircle className="h-6 w-6 shrink-0 text-destructive" />
            <p className="text-muted-foreground">Diese Einladung ist abgelaufen. Bitte wende dich an den MSC für eine neue Einladung.</p>
          </div>
        )}

        {state.kind === 'ready' && !state.preview.consumed && !state.preview.expired && (
          <>
            <p className="mt-2 text-muted-foreground">
              Du wurdest eingeladen, deine Fotos von <strong>{state.preview.eventNames.join(', ')}</strong> auf RacePic zu
              veröffentlichen.
            </p>

            {step === 'enter-email' && (
              <form onSubmit={handleConfirmEmail} className="mt-8 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Einladung für <strong>{state.preview.maskedEmail}</strong>.
                </p>
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox checked={termsAccepted} onCheckedChange={(value) => setTermsAccepted(value === true)} />
                  <span>
                    Ich akzeptiere die Nutzungsbedingungen für RacePic-Fotograf:innen.
                  </span>
                </label>
                {(error || claimError) && <p className="text-sm text-destructive">{error ?? claimError}</p>}
                <Button type="submit" className="w-full" disabled={pending || !termsAccepted}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'E-Mail bestätigen'}
                </Button>
              </form>
            )}

            {step === 'enter-code' && (
              <form onSubmit={handleCodeSubmit} className="mt-8 space-y-4">
                <p className="text-sm text-muted-foreground">Bitte gib den Code aus der E-Mail ein.</p>
                {/* Cognito EMAIL_OTP-Codes sind 8-stellig, nicht 6 (Bug gefunden 2026-09-22, siehe StudioLoginPage.tsx). */}
                <InputOTP maxLength={8} value={codeInput} onChange={setCodeInput}>
                  <InputOTPGroup>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {(error || claimError) && <p className="text-sm text-destructive">{error ?? claimError}</p>}
                <Button type="submit" className="w-full" disabled={pending || claiming || codeInput.length < 8}>
                  {pending || claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Profil aktivieren'}
                </Button>
              </form>
            )}
          </>
        )}
      </section>
    </MainLayout>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createPaymentDashboardLink,
  createPaymentOnboardingLink,
  deleteMyPasskey,
  fetchPasskeyRegistrationOptions,
  fetchPaymentAccount,
  fetchStepUpChallenge,
  listMyPasskeys,
  verifyPasskeyRegistration,
  verifyStepUp,
  type PasskeySummary,
  type PaymentAccountView
} from '@/integrations/racepic/client';
import { isPasskeyRequired, payoutsErrorMessage, runWithStrongStepUp, type StepUpSteps } from '@/integrations/racepic/payoutsFlow';
import { platformAuthenticatorLabel } from '@/integrations/racepic/passkeySupport';
import { StudioPasskeyOnboarding, StudioPasskeySetupSuccess } from './StudioPasskeyOnboarding';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Einrichtung läuft',
  ENABLED: 'Bereit',
  RESTRICTED: 'Eingeschränkt – Angaben fehlen',
  DISABLED: 'Gesperrt'
};

const stepUpSteps: StepUpSteps = {
  fetchOptions: async () => (await fetchStepUpChallenge('PAYMENT_ACCOUNT')).options,
  authenticate: (options) => startAuthentication({ optionsJSON: options as Parameters<typeof startAuthentication>[0]['optionsJSON'] }),
  verify: (assertion) => verifyStepUp('PAYMENT_ACCOUNT', assertion)
};

/**
 * Auszahlungen (Marketplace-Plan, AP05/AP06): Passkey anlegen und das Stripe-Auszahlungskonto einrichten. Konto-
 * und Dashboard-Link brauchen bei jedem Aufruf eine frische Passkey-Bestaetigung. Sichtbar nur, wenn das
 * Backend-Flag commerceSettlement an ist. Auszahlungen selbst werden erst nach geklaertem Steuerstatus freigegeben.
 */
export function StudioPayoutsPanel() {
  const [passkeys, setPasskeys] = useState<PasskeySummary[]>([]);
  const [account, setAccount] = useState<PaymentAccountView | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // Zeigt nach der allerersten Einrichtung kurz eine Erfolgsmeldung statt sofort zur Kontoliste zu springen.
  const [justSetUpPasskey, setJustSetUpPasskey] = useState(false);

  const load = useCallback(async (refresh: boolean) => {
    try {
      const [keys, status] = await Promise.all([listMyPasskeys(), fetchPaymentAccount(refresh)]);
      setPasskeys(keys.passkeys);
      setAccount(status.paymentAccount);
      setError('');
    } catch (err) {
      setError(payoutsErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Nach der Rueckkehr von Stripe (?onboarding=return|refresh) den Stand direkt abgleichen.
    const returning = new URLSearchParams(window.location.search).has('onboarding');
    void load(returning);
  }, [load]);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await task();
    } catch (err) {
      setError(isPasskeyRequired(err) ? 'Bitte bestätige zuerst einmal dein Gerät (siehe oben).' : payoutsErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const addPasskey = () =>
    run(async () => {
      const wasFirst = passkeys.length === 0;
      const { options } = await fetchPasskeyRegistrationOptions();
      const response = await startRegistration({ optionsJSON: options as Parameters<typeof startRegistration>[0]['optionsJSON'] });
      await verifyPasskeyRegistration(response, navigator.platform || undefined);
      if (wasFirst) setJustSetUpPasskey(true);
      else setMessage('Passkey wurde angelegt.');
      await load(false);
    });

  const removePasskey = (passkeyId: string) => {
    if (!window.confirm('Passkey wirklich entfernen?')) return;
    return run(async () => {
      await deleteMyPasskey(passkeyId);
      await load(false);
    });
  };

  const openLink = (create: () => Promise<{ url: string }>) =>
    run(async () => {
      // Vorwarnung, bevor der Browser ungefragt den Geraete-Dialog oeffnet ("gleich" statt "jetzt": der Dialog
      // erscheint nur, wenn die Sitzung nicht mehr frisch genug ist, nicht bei jedem Aufruf).
      setMessage(`Falls dein Gerät gleich nach einer Bestätigung fragt: Das ist ${platformAuthenticatorLabel()}.`);
      const link = await runWithStrongStepUp(create, stepUpSteps);
      window.location.assign(link.url);
    });

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-accent" />;

  const needsPasskey = passkeys.length === 0;
  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <section className="space-y-3">
        {passkeys.length === 0 && !justSetUpPasskey && <StudioPasskeyOnboarding busy={busy} onSetup={() => void addPasskey()} />}
        {justSetUpPasskey && <StudioPasskeySetupSuccess onContinue={() => setJustSetUpPasskey(false)} />}
        {passkeys.length > 0 && !justSetUpPasskey && (
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <h2 className="font-heading text-lg font-bold">Gerätebestätigung</h2>
            <ul className="space-y-2 text-sm">
              {passkeys.map((passkey) => (
                <li key={passkey.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                  <span>
                    {passkey.label || 'Gerät'} · eingerichtet {new Date(passkey.createdAt).toLocaleDateString('de-DE')}
                    {passkey.lastUsedAt ? ` · zuletzt genutzt ${new Date(passkey.lastUsedAt).toLocaleDateString('de-DE')}` : ''}
                  </span>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] text-destructive" disabled={busy} onClick={() => void removePasskey(passkey.id)}>
                    Entfernen
                  </Button>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void addPasskey()}>
              Weiteres Gerät hinzufügen
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-bold">Auszahlungskonto</h2>
          {account?.status && <Badge variant={account.status === 'ENABLED' ? 'default' : 'secondary'}>{STATUS_LABEL[account.status] ?? account.status}</Badge>}
        </div>
        {!account?.hasAccount && <p className="text-sm text-muted-foreground">Noch kein Konto eingerichtet. Die Einrichtung läuft über den Zahlungsdienst Stripe.</p>}
        {account?.requirements && (account.requirements.currentlyDue.length > 0 || account.requirements.pastDue.length > 0) && (
          <p className="text-sm text-muted-foreground">Bei Stripe fehlen noch Angaben. Setze die Einrichtung fort, um sie zu ergänzen.</p>
        )}
        {account?.status === 'ENABLED' && !account.payoutsReleased && (
          <p className="text-sm text-muted-foreground">Dein Konto ist bereit. Der MSC gibt Auszahlungen frei, sobald dein Steuerstatus geklärt ist.</p>
        )}
        {needsPasskey && <p className="text-sm text-muted-foreground">Bestätige zuerst einmal dein Gerät (siehe oben).</p>}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy || needsPasskey || account?.status === 'DISABLED'} onClick={() => void openLink(createPaymentOnboardingLink)}>
            {account?.hasAccount ? 'Einrichtung fortsetzen' : 'Einrichtung starten'}
          </Button>
          {account?.detailsSubmitted && (
            <Button size="sm" variant="outline" disabled={busy || needsPasskey} onClick={() => void openLink(createPaymentDashboardLink)}>
              Stripe-Dashboard öffnen
            </Button>
          )}
          {account?.hasAccount && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(() => load(true))}>
              Status aktualisieren
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

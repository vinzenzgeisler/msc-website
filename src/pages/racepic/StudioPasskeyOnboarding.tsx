import { useEffect, useState } from 'react';
import { CheckCircle2, Fingerprint, ScanFace, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkPasskeySupport, checkPlatformAuthenticatorAvailable, platformAuthenticatorLabel, type PasskeySupport } from '@/integrations/racepic/passkeySupport';

/**
 * Erklaer- und Einrichtungsablauf fuer den ersten Passkey (Marketplace-Plan AP05). Die Zielgruppe kennt Passkeys
 * ueberwiegend nicht; deshalb zuerst eine kurze, alltagssprachliche Erklaerung mit Vergleich zum Handy-Entsperren,
 * dann ein einzelner klarer Schritt. Kein Fachjargon im Fliesstext, "Passkey" nur als Beiwort in Klammern.
 */
export function StudioPasskeyOnboarding({ busy, onSetup }: { busy: boolean; onSetup: () => void }) {
  const [support, setSupport] = useState<PasskeySupport>('unknown');
  const [platformHint, setPlatformHint] = useState<string | null>(null);

  useEffect(() => {
    setSupport(checkPasskeySupport());
    void checkPlatformAuthenticatorAvailable().then((available) => setPlatformHint(available ? platformAuthenticatorLabel() : null));
  }, []);

  if (support === 'unsupported') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Dein Browser unterstützt diese Bestätigung noch nicht.</p>
        <p className="mt-1">
          Bitte öffne die Auszahlungseinrichtung in einem aktuellen Browser (z. B. Chrome, Safari oder Edge) oder auf einem anderen Gerät.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-accent/10 p-2 text-accent">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">Bevor du dein Auszahlungskonto einrichtest, bestätige einmal dein Gerät</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Das funktioniert genauso, wie du dein Handy oder deinen Laptop entsperrst: mit Fingerabdruck, Gesichtserkennung oder deinem Gerätecode
            {platformHint ? ` (bei dir vermutlich mit ${platformHint})` : ''}. Es gibt kein Passwort zum Merken, und die Bestätigung bleibt sicher auf
            deinem Gerät gespeichert &ndash; wir sehen sie nie.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2 text-sm">
          <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>Damit bestätigst du sicher, dass wirklich du es bist, bevor Geld an dich ausgezahlt wird.</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <ScanFace className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>Du brauchst dasselbe Gerät (oder ein gekoppeltes) für spätere Bestätigungen, z. B. beim Öffnen deines Auszahlungs-Dashboards.</span>
        </div>
      </div>

      <Button disabled={busy} onClick={onSetup} className="w-full sm:w-auto">
        {busy ? 'Bitte am Gerät bestätigen…' : 'Jetzt einrichten'}
      </Button>
    </div>
  );
}

/** Kurzbestaetigung nach erfolgreicher Ersteinrichtung. */
export function StudioPasskeySetupSuccess({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-semibold">Eingerichtet.</p>
        <p className="mt-1">Du kannst jetzt mit der Einrichtung deines Auszahlungskontos fortfahren.</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={onContinue}>
          Weiter
        </Button>
      </div>
    </div>
  );
}

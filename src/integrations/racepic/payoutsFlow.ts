import { RacePicApiError } from './client';

/** Bausteine des Passkey-Nachweises; im Browser liefern @simplewebauthn/browser und die API-Funktionen aus client.ts die Umsetzung. */
export type StepUpSteps = {
  /** Holt die WebAuthn-Optionen fuer den Step-up beim Server. */
  fetchOptions: () => Promise<unknown>;
  /** Fragt den Passkey beim Browser/Authenticator ab (Nutzerinteraktion). */
  authenticate: (options: unknown) => Promise<unknown>;
  /** Schickt die Assertion zur Pruefung an den Server, der daraufhin einen Grant ausstellt. */
  verify: (assertion: unknown) => Promise<unknown>;
};

/**
 * Fuehrt eine Aktion aus, die den Passkey-Nachweis (Step-up `strong`) verlangt. Antwortet der Server mit
 * `STEP_UP_REQUIRED`, wird genau einmal ein Nachweis eingeholt und die Aktion danach genau einmal wiederholt:
 * kein Schleifen, damit ein wiederholt fehlschlagender Nachweis nie zu einer Endlosschleife oder mehreren
 * Passkey-Abfragen fuehrt. Der Grant gilt serverseitig fuer genau einen Aufruf.
 */
export async function runWithStrongStepUp<T>(action: () => Promise<T>, steps: StepUpSteps): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (!(error instanceof RacePicApiError) || error.code !== 'STEP_UP_REQUIRED') throw error;
  }
  const options = await steps.fetchOptions();
  const assertion = await steps.authenticate(options);
  await steps.verify(assertion);
  return action();
}

/** Ob der Fehler bedeutet, dass die Person zuerst einen Passkey anlegen muss. */
export const isPasskeyRequired = (error: unknown): boolean => error instanceof RacePicApiError && error.code === 'PASSKEY_REQUIRED';

/** Verstaendliche Meldung zu Fehlern rund um Passkeys und das Auszahlungskonto. */
export const payoutsErrorMessage = (error: unknown): string => {
  if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
    return 'Die Passkey-Abfrage wurde abgebrochen. Bitte erneut versuchen.';
  }
  if (error instanceof DOMException && error.name === 'InvalidStateError') {
    return 'Dieser Passkey ist bereits für dein Konto registriert.';
  }
  const code = error instanceof RacePicApiError ? error.code : undefined;
  switch (code) {
    case 'PASSKEY_REQUIRED':
      return 'Bitte lege zuerst einen Passkey an.';
    case 'STEP_UP_REQUIRED':
      return 'Bitte melde dich erneut an und versuche es dann noch einmal.';
    case 'CHALLENGE_INVALID':
      return 'Die Bestätigung ist abgelaufen. Bitte erneut versuchen.';
    case 'VERIFICATION_FAILED':
      return 'Der Passkey konnte nicht bestätigt werden.';
    case 'ONBOARDING_INCOMPLETE':
      return 'Bitte schließe zuerst die Angaben bei Stripe ab.';
    case 'NO_ACCOUNT':
      return 'Es gibt noch kein Auszahlungskonto. Starte zuerst die Einrichtung.';
    case 'PHOTOGRAPHER_NOT_ELIGIBLE':
      return 'Dein Zugang ist für Auszahlungen noch nicht freigeschaltet.';
    case 'STRIPE_UNAVAILABLE':
      return 'Der Zahlungsdienst ist gerade nicht erreichbar. Bitte später erneut versuchen.';
    case 'COMMERCE_DISABLED':
      return 'Auszahlungen sind noch nicht freigeschaltet.';
    default:
      return 'Das hat nicht geklappt. Bitte später erneut versuchen.';
  }
};

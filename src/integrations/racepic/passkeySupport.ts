/**
 * Geraeteunterstuetzung und laienverstaendliche Hinweise fuer Passkeys (Marketplace-Plan AP05).
 * Die Zielgruppe (Motorsport-Fotograf:innen) kennt den Begriff ueberwiegend nicht; die Texte vermeiden ihn
 * deshalb dort, wo eine Alltagsbeschreibung reicht ("Fingerabdruck, Gesichtserkennung oder Gerätecode").
 */

export type PasskeySupport = 'supported' | 'unsupported' | 'unknown';

/** Grobe Pruefung, ob der Browser Passkeys ueberhaupt anbieten kann. `unknown` vor der Pruefung bzw. ohne Browser. */
export const checkPasskeySupport = (): PasskeySupport => {
  if (typeof window === 'undefined' || typeof PublicKeyCredential === 'undefined') return 'unsupported';
  return 'supported';
};

/** Ob zusaetzlich ein geraeteeigener Passkey (Fingerabdruck/Gesicht/PIN, kein Sicherheitsschlüssel) verfuegbar ist. */
export const checkPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || typeof PublicKeyCredential === 'undefined') return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

/** Plattformspezifischer Name fuer die Bestätigung, ohne Fachbegriff "Passkey" zu wiederholen. */
export const platformAuthenticatorLabel = (): string => {
  if (typeof navigator === 'undefined') return 'Fingerabdruck, Gesichtserkennung oder Gerätecode';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'Face ID oder Touch ID';
  if (/Macintosh/.test(ua)) return 'Touch ID';
  if (/Android/.test(ua)) return 'Fingerabdruck oder Gesichtserkennung';
  if (/Windows/.test(ua)) return 'Windows Hello (Fingerabdruck, Gesichtserkennung oder PIN)';
  return 'Fingerabdruck, Gesichtserkennung oder Gerätecode';
};

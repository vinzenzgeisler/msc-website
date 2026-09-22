// RacePic-Fotografen-Session (Paket 2b). Nur ein `localStorage`-Store fuer den MVP - kein
// Refresh-Rotation-Flow o.ae. hier; das folgt mit dem Step-up/Marketplace-Ausbau (Abschnitt E).
import type { PhotographerTokens } from './photographerAuth';

const STORAGE_KEY = 'racepic_photographer_session';

type StoredSession = PhotographerTokens;

const readSession = (): StoredSession | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
};

export const savePhotographerSession = (tokens: PhotographerTokens): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // Privater Modus o.ae. - Session lebt dann nur fuer den aktuellen Tab-Zustand nicht weiter.
  }
};

export const clearPhotographerSession = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const getPhotographerAccessToken = (): string | null => {
  const session = readSession();
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    clearPhotographerSession();
    return null;
  }
  return session.accessToken;
};

/**
 * Fuer den `Authorization`-Header gegen die API (siehe client.ts): Cognito-Access-Tokens tragen
 * keine `email`/`email_verified`-Claims (Bug gefunden 2026-09-22 beim ersten echten Claim-Test -
 * `getPhotographerAuthContext` im Backend braucht genau diese, z. B. fuer `/photographer/claim`).
 * Das ID-Token hat sie, plus ein echtes `aud`-Claim, das zum `jwtAudience`-Check des
 * API-Gateway-Authorizers passt (beim Access-Token funktioniert das nur ueber eine
 * Cognito-spezifische `client_id`-Sonderbehandlung).
 */
export const getPhotographerIdToken = (): string | null => {
  const session = readSession();
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    clearPhotographerSession();
    return null;
  }
  return session.idToken;
};

export const isPhotographerSignedIn = (): boolean => getPhotographerAccessToken() !== null;

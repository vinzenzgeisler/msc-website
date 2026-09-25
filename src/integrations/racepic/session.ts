import { refreshPhotographerTokens, type PhotographerTokens } from './photographerAuth';
import { z } from 'zod';

const STORAGE_KEY = 'racepic_photographer_session';

type StoredSession = PhotographerTokens;
const storedSessionSchema = z.object({
  accessToken: z.string().min(1),
  idToken: z.string().min(1),
  refreshToken: z.string().min(1).nullable(),
  expiresAt: z.number().finite().positive()
});

const readSession = (): StoredSession | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = storedSessionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data as StoredSession : null;
  } catch {
    return null;
  }
};

let refreshInFlight: Promise<StoredSession | null> | null = null;

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
    return null;
  }
  return session.idToken;
};

export const getPhotographerIdTokenAsync = async (): Promise<string | null> => {
  const current = readSession();
  if (!current) return null;
  if (current.expiresAt > Date.now() + 30_000) return current.idToken;
  if (!current.refreshToken) { clearPhotographerSession(); return null; }
  if (!refreshInFlight) {
    refreshInFlight = refreshPhotographerTokens(current.refreshToken)
      .then((tokens) => { savePhotographerSession(tokens); return tokens; })
      .catch(() => { clearPhotographerSession(); return null; })
      .finally(() => { refreshInFlight = null; });
  }
  return (await refreshInFlight)?.idToken ?? null;
};

export const isPhotographerSignedIn = (): boolean => {
  const session = readSession();
  return !!session && (session.expiresAt > Date.now() || !!session.refreshToken);
};

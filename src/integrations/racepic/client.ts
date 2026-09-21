// RacePic-API-Client (Paket 2b). Die RacePic-Routen laufen auf derselben HTTP API wie das
// bestehende Nennungstool-Backend (siehe api-stack.ts im MSC-Event-Backend-Repo), deshalb wird
// dieselbe Basis-URL/Proxy-Konfiguration wie in ../event-backend/client.ts wiederverwendet.
import { getPhotographerAccessToken } from './session';

const configuredEventApiBaseUrl = (import.meta.env.VITE_EVENT_API_BASE_URL || '').replace(/\/$/, '');
const eventApiBaseUrl = import.meta.env.DEV && configuredEventApiBaseUrl ? '/event-api' : configuredEventApiBaseUrl;

export const isRacePicApiConfigured = (): boolean => configuredEventApiBaseUrl.length > 0;

class RacePicApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string
  ) {
    super(code);
  }
}

async function requestJson<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T> {
  if (!isRacePicApiConfigured()) {
    throw new RacePicApiError(0, 'RACEPIC_API_NOT_CONFIGURED');
  }
  const headers: Record<string, string> = { 'content-type': 'application/json', ...(init?.headers as Record<string, string> ?? {}) };
  if (init?.auth) {
    const token = getPhotographerAccessToken();
    if (!token) {
      throw new RacePicApiError(401, 'NOT_AUTHENTICATED');
    }
    headers.authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${eventApiBaseUrl}${path}`, { ...init, headers });
  const payload = (await response.json().catch(() => null)) as (T & { ok?: boolean; code?: string }) | null;
  if (!response.ok || !payload) {
    throw new RacePicApiError(response.status, payload?.code ?? `HTTP_${response.status}`);
  }
  return payload;
}

export { RacePicApiError };

export type InvitationPreview = {
  eventNames: string[];
  maskedEmail: string;
  expired: boolean;
  consumed: boolean;
};

export const fetchInvitationPreview = (token: string) =>
  requestJson<InvitationPreview>(`/public/racepic/invitations/${encodeURIComponent(token)}`);

// `email` ist die volle, unmaskierte Adresse - siehe Begruendung im Backend-Handler
// (api/src/racepic/handler.ts) bei diesem Endpunkt. Wird als Cognito-USERNAME fuer den
// anschliessenden Email-OTP-Login gebraucht (photographerAuth.ts).
export const startInvitation = (token: string) =>
  requestJson<{ ok: true; email: string }>(`/public/racepic/invitations/${encodeURIComponent(token)}/start`, { method: 'POST' });

export type PhotographerProfile = {
  id: string;
  email: string;
  displayName: string;
  legalName: string | null;
  copyrightLine: string | null;
  website: string | null;
  social: Record<string, string>;
  avatarKey: string | null;
  defaultLicenseId: string | null;
  status: string;
  termsAcceptedVersion: string | null;
};

export const claimInvitation = (token: string, termsVersion: string) =>
  requestJson<{ ok: true; photographer: PhotographerProfile }>('/photographer/claim', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ token, termsVersion })
  });

export const fetchMyProfile = () => requestJson<{ ok: true; photographer: PhotographerProfile }>('/photographer/me', { auth: true });

export const updateMyProfile = (patch: Partial<Omit<PhotographerProfile, 'id' | 'email' | 'status' | 'termsAcceptedVersion'>>) =>
  requestJson<{ ok: true; photographer: PhotographerProfile }>('/photographer/me', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(patch)
  });

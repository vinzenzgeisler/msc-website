// RacePic-API-Client (Paket 2b). Die RacePic-Routen laufen auf derselben HTTP API wie das
// bestehende Nennungstool-Backend (siehe api-stack.ts im MSC-Event-Backend-Repo), deshalb wird
// dieselbe Basis-URL/Proxy-Konfiguration wie in ../event-backend/client.ts wiederverwendet.
import { getPhotographerIdTokenAsync } from './session';

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
    const token = await getPhotographerIdTokenAsync();
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

export const registerMyProfile = (displayName: string, termsVersion: string) =>
  requestJson<{ ok: true; photographer: PhotographerProfile }>('/photographer/register', {
    method: 'POST', auth: true, body: JSON.stringify({ displayName, termsVersion })
  });

export const setMyPassword = (password: string) =>
  requestJson<{ ok: true }>('/photographer/password', { method: 'POST', auth: true, body: JSON.stringify({ password }) });

export const fetchMyProfile = () => requestJson<{ ok: true; photographer: PhotographerProfile }>('/photographer/me', { auth: true });

export const updateMyProfile = (patch: Partial<Omit<PhotographerProfile, 'id' | 'email' | 'status' | 'termsAcceptedVersion'>>) =>
  requestJson<{ ok: true; photographer: PhotographerProfile }>('/photographer/me', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(patch)
  });

export type PhotographerEventAccess = {
  eventId: string;
  eventName: string;
  uploadOpensAt: string | null;
  uploadClosesAt: string | null;
  quotaImages: number | null;
};

export const fetchMyEventAccess = () => requestJson<{ ok: true; events: PhotographerEventAccess[] }>('/photographer/events', { auth: true });

export type LicenseOption = {
  id: string;
  code: string;
  title: Record<string, string>;
  summary: Record<string, string>;
  attributionRequired: boolean;
  pricingKind: 'FREE' | 'PAID';
};

export const fetchLicenses = () => requestJson<{ ok: true; licenses: LicenseOption[] }>('/photographer/licenses', { auth: true });

// --- Paket 3b: Upload --------------------------------------------------------------------------
// Spiegelt api/src/racepic/handler.ts (MSC-Event-Backend-Repo) 1:1 - siehe dort fuer die
// serverseitigen Regeln (Groessenlimits, Event-Berechtigung, Upload-Fenster, Quota).

export type UploadBatch = {
  id: string;
  eventId: string;
  licenseId: string;
  fileCount: number;
  completedCount: number;
  failedCount: number;
};

export const createUploadBatch = (eventId: string, licenseId: string) =>
  requestJson<{ ok: true; batch: UploadBatch }>(`/photographer/events/${encodeURIComponent(eventId)}/batches`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ licenseId })
  });

export type CreatedUpload = {
  upload: { id: string; status: string; fileName: string | null; declaredSizeBytes: number; expiresAt: string };
  uploadUrl: string | null;
  s3UploadId: string | null;
  requiredHeaders: Record<string, string>;
};

export const createUpload = (batchId: string, file: { name: string; type: 'image/jpeg' | 'image/png'; size: number; fingerprint?: string }) =>
  requestJson<{ ok: true } & CreatedUpload>(`/photographer/batches/${encodeURIComponent(batchId)}/uploads`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(file)
  });

export const presignUploadParts = (uploadId: string, partNumbers: number[]) =>
  requestJson<{ ok: true; parts: { partNumber: number; url: string }[] }>(`/photographer/uploads/${encodeURIComponent(uploadId)}/parts`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ partNumbers })
  });

export const listUploadedParts = (uploadId: string) =>
  requestJson<{ ok: true; parts: { partNumber: number; eTag: string; size: number }[] }>(
    `/photographer/uploads/${encodeURIComponent(uploadId)}/parts`,
    { auth: true }
  );

export type UploadedImage = {
  id: string;
  eventId: string;
  processingStatus: string;
  visibility: string;
  bytes: number | null;
  createdAt: string;
  thumbUrl: string | null;
  previewUrl: string | null;
  title: string | null;
  description: string | null;
  tags: string[];
  licenseId: string | null;
  offerMode: 'FREE' | 'PAID';
  priceCents: number | null;
};

export const completeUpload = (uploadId: string, parts?: { partNumber: number; eTag: string }[]) =>
  requestJson<{ ok: true; image: UploadedImage | null; alreadyCompleted: boolean }>(`/photographer/uploads/${encodeURIComponent(uploadId)}/complete`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ parts })
  });

export const abortUpload = (uploadId: string) =>
  requestJson<{ ok: true }>(`/photographer/uploads/${encodeURIComponent(uploadId)}`, { method: 'DELETE', auth: true });

export const listMyImages = (params: { eventId?: string; status?: string; limit?: number } = {}) => {
  const search = new URLSearchParams();
  if (params.eventId) search.set('eventId', params.eventId);
  if (params.status) search.set('status', params.status);
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return requestJson<{ ok: true; images: UploadedImage[] }>(`/photographer/images${query ? `?${query}` : ''}`, { auth: true });
};

export type OwnImageDetailsPatch = Partial<Pick<UploadedImage, 'title' | 'description' | 'tags' | 'offerMode' | 'priceCents'>> & { licenseId?: string };
export const updateMyImageDetails = (imageId: string, patch: OwnImageDetailsPatch) =>
  requestJson<{ ok: true; image: UploadedImage }>(`/photographer/images/${encodeURIComponent(imageId)}/details`, {
    method: 'PATCH', auth: true, body: JSON.stringify(patch)
  });

// --- Paket 15: Bild-Selbstverwaltung (Studio-Redesign) ------------------------------------------

/** Nur `visibility: 'HIDDEN'` erlaubt - veröffentlichen/entfernen bleibt Admin-Sache, siehe Backend. */
export const hideMyImage = (imageId: string) =>
  requestJson<{ ok: true; visibility: 'HIDDEN' }>(`/photographer/images/${encodeURIComponent(imageId)}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ visibility: 'HIDDEN' })
  });

/**
 * Nimmt ein eigenes Bild komplett raus, unabhaengig vom Status (Feedback 2026-09-22: "auch als
 * Fotograf will ich mal Fotos rausnehmen können wieder"). Ein DRAFT-Bild wird dabei hart geloescht,
 * ein bereits veroeffentlichtes/verborgenes Bild ueber denselben Weg wie das Admin-"Entfernen"
 * (Bilddateien weg, Datenbankzeile bleibt vorerst als REMOVED) - siehe removeOwnImage im Backend.
 */
export const deleteMyImage = (imageId: string) =>
  requestJson<{ ok: true }>(`/photographer/images/${encodeURIComponent(imageId)}`, { method: 'DELETE', auth: true });

export type OwnImageAssignment = {
  assignmentId: string;
  entryId: string;
  status: string;
  source: string;
  confidence: number | null;
  driverName: string;
  startNumber: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
};

/** Read-only: welche(r) Fahrer wurde(n) diesem eigenen Bild zugeordnet (auch automatisch). */
export const fetchMyImageAssignments = (imageId: string) =>
  requestJson<{ ok: true; assignments: OwnImageAssignment[] }>(`/photographer/images/${encodeURIComponent(imageId)}/assignments`, { auth: true });

/** Fuer eine Rohdatei signierte PUT-Anfrage mit Fortschrittsanzeige (XHR statt fetch, da fetch
 * keinen Upload-Fortschritt liefert - siehe Architekturplan Abschnitt D "kein Fortschritt"). */
export const putWithProgress = (url: string, file: Blob, contentType: string, onProgress: (loaded: number, total: number) => void): Promise<string | null> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('content-type', contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded, event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.getResponseHeader('ETag'));
      } else {
        reject(new Error(`HTTP_${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('NETWORK_ERROR'));
    xhr.send(file);
  });

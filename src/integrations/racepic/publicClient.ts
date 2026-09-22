// Oeffentlicher RacePic-Client (Paket 8). Manifeste kommen direkt vom CDN (statisches JSON, siehe
// api/src/racepic/publish.ts im MSC-Event-Backend-Repo), nicht ueber die API - kein Server-Request
// noetig, um die Galerie zu durchsuchen (Architekturplan Abschnitt B: "Oeffentlicher Traffic trifft
// weder Lambda noch RDS"). Nur der Download-Request geht an die API (signierte URL).

const cdnBaseUrl = (import.meta.env.VITE_RACEPIC_CDN_BASE_URL || '').replace(/\/$/, '');
const configuredEventApiBaseUrl = (import.meta.env.VITE_EVENT_API_BASE_URL || '').replace(/\/$/, '');
const eventApiBaseUrl = import.meta.env.DEV && configuredEventApiBaseUrl ? '/event-api' : configuredEventApiBaseUrl;

export const isRacePicPublicConfigured = (): boolean => cdnBaseUrl.length > 0;

class RacePicPublicError extends Error {
  constructor(public readonly status: number) {
    super(`HTTP_${status}`);
  }
}
export { RacePicPublicError };

async function fetchManifest<T>(path: string): Promise<T> {
  if (!isRacePicPublicConfigured()) throw new RacePicPublicError(0);
  const response = await fetch(`${cdnBaseUrl}${path}`, { cache: 'no-store' });
  if (!response.ok) throw new RacePicPublicError(response.status);
  return (await response.json()) as T;
}

export type RacePicEventSummary = { eventId: string; slug: string; title: string };

export const fetchPublishedEvents = () => fetchManifest<RacePicEventSummary[]>('/manifests/events.json');

export type RacePicParticipant = {
  participantKey: string;
  startNumber: string;
  className: string;
  vehicleType: string;
  displayName: string;
  make: string | null;
  model: string | null;
  imageCount: number;
  coverThumbUrl: string;
};

export type RacePicImage = {
  imageId: string;
  thumbUrl: string;
  previewUrl: string;
  width: number | null;
  height: number | null;
  photographer: { displayName: string; website: string | null; slug: string | null };
  license: { code: string; title: Record<string, string>; attributionRequired: boolean; attributionTemplate: string | null };
};

export type RacePicParticipantGallery = { participant: RacePicParticipant; images: RacePicImage[] };

export const fetchParticipantGallery = (slug: string, participantKey: string) =>
  fetchManifest<RacePicParticipantGallery>(`/manifests/${slug}/p/${encodeURIComponent(participantKey)}.json`);

// --- Paket 12: öffentliches Fotografenprofil --------------------------------------------------

export type RacePicPhotographerImage = {
  imageId: string;
  thumbUrl: string;
  previewUrl: string;
  eventSlug: string;
  eventTitle: string;
  capturedAt: string | null;
};

export type RacePicPhotographerProfile = {
  photographerId: string;
  slug: string;
  displayName: string;
  copyrightLine: string | null;
  website: string | null;
  social: Record<string, string>;
  imageCount: number;
  images: RacePicPhotographerImage[];
};

export const fetchPhotographerProfile = (slug: string) =>
  fetchManifest<RacePicPhotographerProfile>(`/manifests/photographers/${encodeURIComponent(slug)}.json`);

// --- Paket 17: globale Discover-/Suchindex-Manifeste (Landingpage) -----------------------------

export type RacePicDiscoverImage = {
  imageId: string;
  thumbUrl: string;
  previewUrl: string;
  eventSlug: string;
  eventTitle: string;
  capturedAt: string | null;
};

export const fetchDiscoverFeed = () => fetchManifest<RacePicDiscoverImage[]>('/manifests/discover.json');

export type RacePicSearchIndexEntry = {
  participantKey: string;
  eventSlug: string;
  eventTitle: string;
  startNumber: string;
  displayName: string;
  make: string | null;
  model: string | null;
  className: string;
};

export const fetchSearchIndex = () => fetchManifest<RacePicSearchIndexEntry[]>('/manifests/search-index.json');

/** Absolute CDN-URL fuer einen relativen Manifest-Pfad (z. B. `coverThumbUrl`/`thumbUrl`). */
export const toCdnUrl = (relativePath: string): string => `${cdnBaseUrl}${relativePath}`;

export type DownloadVariant = 'small' | 'medium' | 'large' | 'original';

export type DownloadResult = {
  url: string;
  expiresAt: string;
  attribution: {
    photographerName: string;
    copyrightLine: string | null;
    licenseCode: string;
    licenseTitle: Record<string, string>;
    attributionRequired: boolean;
    attributionTemplate: string | null;
  };
};

export const requestDownload = async (imageId: string, variant: DownloadVariant): Promise<DownloadResult> => {
  if (!configuredEventApiBaseUrl) throw new RacePicPublicError(0);
  const response = await fetch(`${eventApiBaseUrl}/public/racepic/images/${encodeURIComponent(imageId)}/download`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ variant })
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) throw new RacePicPublicError(response.status);
  return payload as DownloadResult;
};

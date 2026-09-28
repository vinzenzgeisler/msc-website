import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });

const imageId = '11111111-1111-4111-8111-111111111111';
const baseImage = {
  imageId,
  thumbUrl: `/public/${imageId}/thumb.webp`,
  previewUrl: `/public/${imageId}/preview.webp`,
  width: 1600,
  height: 1000,
  title: null,
  description: null,
  tags: [],
  camera: null,
  capturedAt: null,
  createdAt: '2026-09-28T10:00:00.000Z',
  photographer: { displayName: 'Foto Fritz', website: null, slug: 'foto-fritz' },
  license: { code: 'PAID_PRIVATE', title: { de: 'Privat' }, attributionRequired: false, attributionTemplate: null }
};
const detail = (image: Record<string, unknown>) => ({ image, eventSlug: 'ev', eventTitle: 'Event', participants: [], relatedImages: [] });

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_RACEPIC_CDN_BASE_URL', 'https://cdn.example.test');
  vi.stubEnv('VITE_EVENT_API_BASE_URL', 'https://api.example.test');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.doUnmock('./session');
});

describe('formatEuroCents', () => {
  it('formats display prices per locale without a tax claim', async () => {
    const { formatEuroCents, PRICE_TIERS_CENTS } = await import('./format');
    expect(formatEuroCents(1000, 'de')).toMatch(/^10,00\s€$/);
    expect(formatEuroCents(1500, 'en')).toBe('€15.00');
    expect(formatEuroCents(500, 'unknown-locale')).toMatch(/^5,00\s€$/);
    expect([...PRICE_TIERS_CENTS]).toEqual([500, 1000, 1500, 2000]);
  });
});

describe('public manifest offer', () => {
  it('parses a paid offer for display only', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(detail({ ...baseImage, previewUrl: `/public/${imageId}/o2/preview.webp`, offer: { mode: 'PAID', priceCents: 1000, currency: 'EUR' } }))));
    const { fetchImageDetail, isPaidImage } = await import('./publicClient');
    const result = await fetchImageDetail('ev', imageId);
    expect(isPaidImage(result.image)).toBe(true);
    expect(result.image.offer).toEqual({ mode: 'PAID', priceCents: 1000, currency: 'EUR' });
  });

  it('treats older manifests without an offer as free', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(detail(baseImage))));
    const { fetchImageDetail, isPaidImage } = await import('./publicClient');
    const result = await fetchImageDetail('ev', imageId);
    expect(result.image.offer).toBeUndefined();
    expect(isPaidImage(result.image)).toBe(false);
  });

  it('rejects a manifest with an unknown offer mode', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(detail({ ...baseImage, offer: { mode: 'DONATION', priceCents: 1, currency: 'EUR' } }))));
    const { fetchImageDetail } = await import('./publicClient');
    await expect(fetchImageDetail('ev', imageId)).rejects.toMatchObject({ status: 502 });
  });

  it('accepts offer-versioned public paths for CDN URLs', async () => {
    const { toCdnUrl } = await import('./publicClient');
    expect(toCdnUrl(`/public/${imageId}/o3/preview.webp`)).toBe(`https://cdn.example.test/public/${imageId}/o3/preview.webp`);
  });
});

describe('offer conversion API', () => {
  it('sends the idempotency key and the confirmed request with the photographer token', async () => {
    vi.doMock('./session', () => ({ getPhotographerIdTokenAsync: async () => 'token-abc' }));
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true, created: true, conversion: { id: 'c1', items: [] } }, 201));
    vi.stubGlobal('fetch', fetchMock);
    const { requestOfferConversion } = await import('./client');

    await requestOfferConversion({ imageIds: [imageId], priceCents: 1000, licenseId: 'lic', rightsConfirmed: true }, 'key-12345678');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    // Im Dev-/Testmodus laeuft der Client ueber den Proxy-Pfad /event-api, sonst direkt gegen die API-Basis-URL.
    expect(url).toMatch(/\/photographer\/offer-conversions$/);
    expect(init.method).toBe('POST');
    const headers = init.headers as Record<string, string>;
    expect(headers['idempotency-key']).toBe('key-12345678');
    expect(headers.authorization).toBe('Bearer token-abc');
    expect(JSON.parse(init.body as string)).toEqual({ imageIds: [imageId], priceCents: 1000, licenseId: 'lic', rightsConfirmed: true });
  });

  it('surfaces the backend error code', async () => {
    vi.doMock('./session', () => ({ getPhotographerIdTokenAsync: async () => 'token-abc' }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ ok: false, code: 'CONVERSION_IMAGE_ALREADY_PENDING' }, 409)));
    const { requestOfferConversion, RacePicApiError } = await import('./client');
    await expect(
      requestOfferConversion({ imageIds: [imageId], priceCents: 1000, licenseId: 'lic', rightsConfirmed: true }, 'key-12345678')
    ).rejects.toSatisfy((error: unknown) => error instanceof RacePicApiError && error.status === 409 && error.code === 'CONVERSION_IMAGE_ALREADY_PENDING');
  });
});

describe('conversion messages', () => {
  it('maps known backend codes and falls back for unknown ones', async () => {
    const { conversionErrorMessage, OPEN_CONVERSION_STATUSES } = await import('./conversionMessages');
    expect(conversionErrorMessage('CONVERSION_IMAGE_ALREADY_PENDING')).toMatch(/läuft bereits ein Antrag/);
    expect(conversionErrorMessage('COMMERCE_DISABLED')).toMatch(/noch nicht freigeschaltet/);
    expect(conversionErrorMessage('SOMETHING_ELSE')).toMatch(/später erneut/);
    expect(conversionErrorMessage(undefined)).toMatch(/später erneut/);
    expect([...OPEN_CONVERSION_STATUSES]).toEqual(['REQUESTED', 'PREPARING_ASSETS', 'READY_FOR_REVIEW']);
  });
});

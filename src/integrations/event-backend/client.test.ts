import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('newsletter API routing', () => {
  it('uses the independent newsletter endpoint without changing Event requests', async () => {
    vi.stubEnv('VITE_EVENT_API_BASE_URL', 'https://event.example.test');
    vi.stubEnv('VITE_NEWSLETTER_API_BASE_URL', 'https://newsletter.example.test');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ enabled: true }) });
    vi.stubGlobal('fetch', fetchMock);
    const client = await import('./client');

    await client.fetchNewsletterConfig('de');
    await client.fetchPublicEventHub();

    expect(fetchMock.mock.calls[0][0]).toBe('https://newsletter.example.test/public/newsletter/config?locale=de');
    expect(fetchMock.mock.calls[1][0]).toBe('/event-api/public/events/current/event-hub');
  });

  it('keeps the existing Event endpoint until the newsletter endpoint is configured', async () => {
    vi.stubEnv('VITE_EVENT_API_BASE_URL', 'https://event.example.test');
    vi.stubEnv('VITE_NEWSLETTER_API_BASE_URL', '');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ enabled: true }) });
    vi.stubGlobal('fetch', fetchMock);
    const client = await import('./client');

    await client.fetchNewsletterConfig('de');

    expect(fetchMock.mock.calls[0][0]).toBe('/event-api/public/newsletter/config?locale=de');
  });
});

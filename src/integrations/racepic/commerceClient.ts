import { z } from 'zod';

/**
 * Oeffentlicher Client fuer Quote und Checkout (Marketplace-Plan AP12/AP15). Eigene, kleine Fehlerklasse mit
 * Backend-`code`, damit die Oberflaeche verstaendliche Meldungen zeigen kann (siehe `commerceErrorMessage`).
 */

const configuredEventApiBaseUrl = (import.meta.env.VITE_EVENT_API_BASE_URL || '').replace(/\/$/, '');
const eventApiBaseUrl = import.meta.env.DEV && configuredEventApiBaseUrl ? '/event-api' : configuredEventApiBaseUrl;

export class CommerceApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code?: string
  ) {
    super(code ?? `HTTP_${status}`);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!configuredEventApiBaseUrl) throw new CommerceApiError(0);
  const response = await fetch(`${eventApiBaseUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...((init?.headers as Record<string, string>) ?? {}) }
  });
  const payload = (await response.json().catch(() => null)) as ({ ok?: boolean; code?: string } & Record<string, unknown>) | null;
  if (!response.ok || !payload) throw new CommerceApiError(response.status, payload?.code);
  return payload as T;
}

export type QuoteItem = { imageId: string; priceCents: number; license: { code: string } };
export type QuoteUnavailable = { imageId: string; reason: 'NOT_AVAILABLE' };
export type Quote = {
  quoteId: string;
  expiresAt: string;
  currency: 'EUR';
  items: QuoteItem[];
  totals: { grossCents: number; netCents: number; taxCents: number; taxRateBp: number | null };
  unavailable: QuoteUnavailable[];
};

const quoteSchema = z.object({
  quoteId: z.string().uuid(),
  expiresAt: z.string(),
  currency: z.literal('EUR'),
  items: z.array(z.object({ imageId: z.string().uuid(), priceCents: z.number().int().positive(), license: z.object({ code: z.string() }) })),
  totals: z.object({ grossCents: z.number().int(), netCents: z.number().int(), taxCents: z.number().int(), taxRateBp: z.number().int().nullable() }),
  unavailable: z.array(z.object({ imageId: z.string().uuid(), reason: z.literal('NOT_AVAILABLE') }))
});

/** Preis, Steuer und Kaufbarkeit kommen ausschliesslich vom Server; der Client schickt nur Bild-IDs. */
export const createQuote = async (imageIds: string[]): Promise<Quote> => {
  const result = await request<{ ok: true; quote: unknown }>('/public/commerce/quotes', {
    method: 'POST',
    body: JSON.stringify({ imageIds })
  });
  const parsed = quoteSchema.safeParse(result.quote);
  if (!parsed.success) throw new CommerceApiError(502, 'INVALID_RESPONSE');
  // zod leitet hier trotz durchweg pflichtiger Felder ein optionales Objekt ab (Bibliotheksmacke dieser
  // Kombination aus verschachtelten Objekten); Laufzeitpruefung durch safeParse() oben bleibt vollstaendig.
  return parsed.data as Quote;
};

export type LegalAcceptance = { terms: true; license: true; privacy: true; withdrawal: true; digitalContentWaiver: true };

export const createCheckoutSession = async (quoteId: string, email: string, legalAcceptance: LegalAcceptance): Promise<{ orderId: string; url: string }> => {
  const result = await request<{ ok: true; orderId: string; url: string }>('/public/commerce/checkout-sessions', {
    method: 'POST',
    body: JSON.stringify({ quoteId, email, legalAcceptance })
  });
  return { orderId: result.orderId, url: result.url };
};

export type OrderConfirmationItem = {
  imageId: string;
  title: string | null;
  priceCents: number;
  downloadUrl: string;
  attribution: {
    photographerName: string;
    copyrightLine: string | null;
    licenseCode: string;
    licenseTitle: Record<string, string>;
    attributionRequired: boolean;
    attributionTemplate: string | null;
  };
};
export type OrderConfirmation = { status: 'PENDING' | 'PAID' | 'FAILED'; items: OrderConfirmationItem[] };

/** Nachweis ist die exakte Stripe-Session-ID aus der Rueckleitung; kein Login noetig (Gastkauf ist Standard). */
export const fetchOrderConfirmation = async (orderId: string, sessionId: string): Promise<OrderConfirmation> => {
  const result = await request<{ ok: true; order: OrderConfirmation }>(
    `/public/commerce/orders/${encodeURIComponent(orderId)}?sessionId=${encodeURIComponent(sessionId)}`
  );
  return result.order;
};

export const commerceErrorMessage = (error: unknown): string => {
  const code = error instanceof CommerceApiError ? error.code : undefined;
  switch (code) {
    case 'QUOTE_TAX_NOT_CONFIGURED':
    case 'CHECKOUT_URLS_MISSING':
    case 'COMMERCE_DISABLED':
      return 'Der Kauf ist noch nicht freigeschaltet.';
    case 'QUOTE_NOTHING_AVAILABLE':
      return 'Dieses Bild ist gerade nicht käuflich.';
    case 'STRIPE_UNAVAILABLE':
      return 'Der Zahlungsdienst ist gerade nicht erreichbar. Bitte später erneut versuchen.';
    case 'RATE_LIMITED':
      return 'Zu viele Versuche. Bitte kurz warten und erneut versuchen.';
    case 'ORDER_NOT_FOUND':
    case 'ORDER_ACCESS_DENIED':
      return 'Diese Bestellung wurde nicht gefunden.';
    default:
      return 'Das hat nicht funktioniert. Bitte später erneut versuchen.';
  }
};

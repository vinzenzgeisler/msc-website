import type { EventHubResponse } from '@/lib/eventHubVoting';

const configuredEventApiBaseUrl = (import.meta.env.VITE_EVENT_API_BASE_URL || '').replace(/\/$/, '');
// The event API only allows the production origin. Vite proxies local requests
// so the real data can still be exercised during development without weakening CORS.
const eventApiBaseUrl = import.meta.env.DEV && configuredEventApiBaseUrl ? '/event-api' : configuredEventApiBaseUrl;

export const isEventBackendConfigured = (): boolean => configuredEventApiBaseUrl.length > 0;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isEventBackendConfigured()) {
    throw new Error('EVENT_API_NOT_CONFIGURED');
  }
  const response = await fetch(`${eventApiBaseUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) }
  });
  const payload = (await response.json().catch(() => null)) as (T & { ok?: boolean; code?: string }) | null;
  if (!response.ok || !payload) {
    const code = payload?.code ?? `HTTP_${response.status}`;
    throw new Error(code);
  }
  return payload;
}

export async function fetchPublicEventHub(): Promise<EventHubResponse> {
  return requestJson<EventHubResponse>('/public/events/current/event-hub');
}

export async function fetchPublicEventHubSummary(): Promise<Pick<EventHubResponse, 'event' | 'votingStatus' | 'classes'>> {
  return requestJson('/public/events/current/event-hub/summary');
}

export interface VoteChallenge {
  challengeId: string;
  nonce: string;
  expiresAt: string;
}

export async function requestVoteChallenge(eventId: string, publicKey: string): Promise<VoteChallenge> {
  return requestJson<VoteChallenge>(`/public/events/${eventId}/voting/challenge`, {
    method: 'POST',
    body: JSON.stringify({ publicKey })
  });
}

export interface SubmitVotePayload {
  classId: string;
  entryId: string;
  challengeId: string;
  nonce: string;
  publicKey: string;
  signature: string;
  clientSubmissionKey: string;
}

export async function submitVote(eventId: string, payload: SubmitVotePayload): Promise<{ alreadySubmitted: boolean }> {
  return requestJson(`/public/events/${eventId}/votes`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchDeviceVoteStatus(eventId: string, publicKey: string): Promise<{ votedClassIds: string[] }> {
  return requestJson(`/public/events/${eventId}/voting/device-status`, {
    method: 'POST',
    body: JSON.stringify({ publicKey })
  });
}

export interface PublicAuction {
  eventId: string;
  status: 'open' | 'closed';
  titleI18n: Record<string, string>;
  descriptionI18n: Record<string, string>;
  termsI18n: Record<string, string>;
  imageUrl: string | null;
  videoUrl: string | null;
  startingBidCents: number;
  minIncrementCents: number;
  currentHighestCents: number | null;
  nextMinimumCents: number;
  termsVersion: string;
}

export async function fetchPublicAuction(): Promise<PublicAuction | null> {
  try {
    const payload = await requestJson<{ auction: PublicAuction }>('/public/events/current/auction');
    return payload.auction;
  } catch (error) {
    if (error instanceof Error && (error.message === 'AUCTION_NOT_FOUND' || error.message === 'HTTP_404')) return null;
    throw error;
  }
}

export interface AuctionBidPayload {
  bidderName: string;
  contactType: 'email' | 'phone';
  contactValue: string;
  amountCents: number;
  acceptedBinding: true;
  termsVersion: string;
  clientSubmissionKey: string;
  website: string;
}

export async function submitAuctionBid(eventId: string, payload: AuctionBidPayload) {
  return requestJson<{ bidId: string; amountCents: number; alreadySubmitted: boolean }>(`/public/events/${eventId}/auction/bids`, { method: 'POST', body: JSON.stringify(payload) });
}

import type { EventHubResponse } from '@/lib/eventHubVoting';

const eventApiBaseUrl = (import.meta.env.VITE_EVENT_API_BASE_URL || '').replace(/\/$/, '');

export const isEventBackendConfigured = (): boolean => eventApiBaseUrl.length > 0;

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

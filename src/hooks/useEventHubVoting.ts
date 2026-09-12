import { useQueries, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeviceVoteStatus, fetchPublicEventHubClass, fetchPublicEventHubSummary, isEventBackendConfigured, requestVoteChallenge, submitVote } from '@/integrations/event-backend/client';
import { matchesActiveEvent, type EventHubSummaryResponse } from '@/lib/eventHubVoting';
import { generateClientSubmissionKey, getVoterPublicKeyBase64, isVoterIdentityAvailable, signVoterMessage } from '@/lib/voterIdentity';
import { useMainEvent } from '@/hooks/useMainEvent';

interface UseEventHubVotingResult {
  data: EventHubSummaryResponse | undefined;
  isLoading: boolean;
  /** false when the backend isn't configured, unreachable, or the CMS/backend "current" events have drifted apart. */
  votingEnabled: boolean;
  /** Development-only mode for trying the complete voting flow without sending votes. */
  votingPreview: boolean;
}

const PREVIEW_STORAGE_PREFIX = 'msc_event_hub_vote_preview_';

function isVotingPreviewOpen(): boolean {
  return import.meta.env.DEV
    && typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('previewVoting') === 'open';
}

function readPreviewVotes(eventId: string): string[] {
  try {
    const stored = window.sessionStorage.getItem(`${PREVIEW_STORAGE_PREFIX}${eventId}`);
    return stored ? JSON.parse(stored) as string[] : [];
  } catch {
    return [];
  }
}

function storePreviewVote(eventId: string, classId: string): void {
  const votedClassIds = new Set(readPreviewVotes(eventId));
  votedClassIds.add(classId);
  window.sessionStorage.setItem(`${PREVIEW_STORAGE_PREFIX}${eventId}`, JSON.stringify([...votedClassIds]));
}

export function useEventHubVoting(): UseEventHubVotingResult {
  const { data: mainEvent } = useMainEvent();
  const votingPreview = isVotingPreviewOpen();

  const query = useQuery({
    queryKey: ['event_hub_voting'],
    queryFn: fetchPublicEventHubSummary,
    enabled: isEventBackendConfigured(),
    staleTime: 30_000,
    refetchInterval: 60_000
  });

  const eventMatches = Boolean(
    query.data && mainEvent && matchesActiveEvent({ title: mainEvent.title, start_dt: mainEvent.start_dt }, query.data.event)
  );

  return {
    data: query.data && votingPreview ? { ...query.data, votingStatus: 'open' } : query.data,
    isLoading: query.isLoading,
    votingEnabled: isEventBackendConfigured() && Boolean(query.data) && eventMatches,
    votingPreview
  };
}

export function useEventHubClass(classId: string | undefined) {
  return useQuery({
    queryKey: ['event_hub_class', classId],
    queryFn: () => fetchPublicEventHubClass(classId as string),
    enabled: Boolean(classId) && isEventBackendConfigured(),
    staleTime: 30_000,
    refetchInterval: 60_000
  });
}

export function useEventHubClasses(classIds: string[]) {
  return useQueries({
    queries: [...new Set(classIds)].map((classId) => ({
      queryKey: ['event_hub_class', classId],
      queryFn: () => fetchPublicEventHubClass(classId),
      enabled: isEventBackendConfigured(),
      staleTime: 30_000,
      refetchInterval: 60_000
    }))
  });
}

export function useDeviceVoteStatus(eventId: string | undefined) {
  const votingPreview = isVotingPreviewOpen();

  return useQuery({
    queryKey: ['event_hub_device_status', eventId, votingPreview ? 'preview' : 'live'],
    queryFn: async () => {
      if (votingPreview) return { votedClassIds: readPreviewVotes(eventId as string) };
      const publicKey = await getVoterPublicKeyBase64();
      return fetchDeviceVoteStatus(eventId as string, publicKey);
    },
    enabled: Boolean(eventId) && isEventBackendConfigured(),
    staleTime: 10_000
  });
}

export function useCastVote(eventId: string | undefined) {
  const queryClient = useQueryClient();
  const votingPreview = isVotingPreviewOpen();

  return useMutation({
    mutationFn: async ({ classId, entryId }: { classId: string; entryId: string }) => {
      if (!eventId) throw new Error('EVENT_NOT_READY');
      if (votingPreview) {
        storePreviewVote(eventId, classId);
        return { alreadySubmitted: false };
      }
      const available = await isVoterIdentityAvailable();
      if (!available) throw new Error('VOTER_IDENTITY_UNAVAILABLE');

      const publicKey = await getVoterPublicKeyBase64();
      const challenge = await requestVoteChallenge(eventId, publicKey);
      const clientSubmissionKey = generateClientSubmissionKey();
      const message = `${challenge.challengeId}.${eventId}.${classId}.${entryId}.${clientSubmissionKey}.${challenge.nonce}`;
      const signature = await signVoterMessage(message);

      return submitVote(eventId, {
        classId,
        entryId,
        challengeId: challenge.challengeId,
        nonce: challenge.nonce,
        publicKey,
        signature,
        clientSubmissionKey
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['event_hub_device_status', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['event_hub_voting'] });
      void queryClient.invalidateQueries({ queryKey: ['event_hub_class'] });
    }
  });
}

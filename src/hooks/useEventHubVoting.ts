import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDeviceVoteStatus, fetchPublicEventHub, isEventBackendConfigured, requestVoteChallenge, submitVote } from '@/integrations/event-backend/client';
import { matchesActiveEvent, type EventHubResponse } from '@/lib/eventHubVoting';
import { generateClientSubmissionKey, getVoterPublicKeyBase64, isVoterIdentityAvailable, signVoterMessage } from '@/lib/voterIdentity';
import { useMainEvent } from '@/hooks/useMainEvent';

interface UseEventHubVotingResult {
  data: EventHubResponse | undefined;
  isLoading: boolean;
  /** false when the backend isn't configured, unreachable, or the CMS/backend "current" events have drifted apart. */
  votingEnabled: boolean;
}

export function useEventHubVoting(): UseEventHubVotingResult {
  const { data: mainEvent } = useMainEvent();

  const query = useQuery({
    queryKey: ['event_hub_voting'],
    queryFn: fetchPublicEventHub,
    enabled: isEventBackendConfigured(),
    staleTime: 30_000,
    refetchInterval: 60_000
  });

  const eventMatches = Boolean(
    query.data && mainEvent && matchesActiveEvent({ title: mainEvent.title, start_dt: mainEvent.start_dt }, query.data.event)
  );

  return {
    data: query.data,
    isLoading: query.isLoading,
    votingEnabled: isEventBackendConfigured() && Boolean(query.data) && eventMatches
  };
}

export function useDeviceVoteStatus(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event_hub_device_status', eventId],
    queryFn: async () => {
      const publicKey = await getVoterPublicKeyBase64();
      return fetchDeviceVoteStatus(eventId as string, publicKey);
    },
    enabled: Boolean(eventId) && isEventBackendConfigured(),
    staleTime: 10_000
  });
}

export function useCastVote(eventId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, entryId }: { classId: string; entryId: string }) => {
      if (!eventId) throw new Error('EVENT_NOT_READY');
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
    }
  });
}

import { useQuery } from '@tanstack/react-query';
import { fetchPublicEventHubSummary, isEventBackendConfigured } from '@/integrations/event-backend/client';

export function useBackendClasses() {
  return useQuery({
    queryKey: ['event_backend_classes'],
    queryFn: async () => (await fetchPublicEventHubSummary()).classes,
    enabled: isEventBackendConfigured(),
    staleTime: 5 * 60_000
  });
}

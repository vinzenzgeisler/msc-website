import { useQuery } from '@tanstack/react-query';
import { fetchPublicEventHub, isEventBackendConfigured } from '@/integrations/event-backend/client';

export function useBackendClasses() {
  return useQuery({
    queryKey: ['event_backend_classes'],
    queryFn: async () => (await fetchPublicEventHub()).classes,
    enabled: isEventBackendConfigured(),
    staleTime: 5 * 60_000
  });
}

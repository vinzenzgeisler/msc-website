import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pb } from '@/integrations/pocketbase/client';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

interface HealthItem {
  key: string;
  ok: boolean;
  message: string;
}

async function checkCollection(key: string, collectionName: string, singleton = false): Promise<HealthItem> {
  try {
    const result = await pb.collection(collectionName).getList(1, 1);
    if (singleton && result.items.length === 0) {
      return {
        key,
        ok: false,
        message: `${collectionName}: kein Datensatz vorhanden`,
      };
    }

    return {
      key,
      ok: true,
      message: `${collectionName}: ok`,
    };
  } catch (error) {
    return {
      key,
      ok: false,
      message: `${collectionName}: ${getPocketBaseErrorMessage(error, 'Prüfung fehlgeschlagen')}`,
    };
  }
}

export function useAdminHealth() {
  return useQuery({
    queryKey: ['admin_health'],
    staleTime: 30_000,
    queryFn: async () => {
      try {
        const result = await pb.send<{
          ok: boolean;
          checks: HealthItem[];
        }>('/api/cms/admin/health', {
          method: 'GET',
        });

        return result;
      } catch {
        const checks = await Promise.all([
          checkCollection('siteSettings', 'siteSettings', true),
          checkCollection('pageContents', 'pageContents'),
          checkCollection('downloads', 'downloads'),
          checkCollection('media', 'media'),
          checkCollection('boardMembers', 'boardMembers'),
          checkCollection('posts', 'posts'),
          checkCollection('calendarEvents', 'calendarEvents'),
        ]);

        return {
          ok: checks.every((item) => item.ok),
          checks,
        };
      }
    },
  });
}

export function useRepairAdminHealth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      pb.send<{
        ok: boolean;
        message?: string;
      }>('/api/cms/admin/repair', {
        method: 'POST',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin_health'] });
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin_health'] });
    },
  });
}

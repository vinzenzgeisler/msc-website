import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, EventArchive, mapEventArchiveRecord, listAllRecords } from '@/integrations/pocketbase/client';

export function useEventArchives() {
  return useQuery({
    queryKey: ['event_archives'],
    queryFn: async () => {
      const data = await listAllRecords('eventArchive');
      return (data.map(mapEventArchiveRecord) as EventArchive[]).sort(
        (a, b) => b.year - a.year,
      );
    },
  });
}

export function useCreateEventArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (archive: Omit<EventArchive, 'id' | 'created_at'>) => {
      const data = await pb.collection('eventArchive').create({
        title: archive.title,
        year: archive.year,
        description: archive.description || '',
        albumId: archive.album_id || null,
        sortOrder: archive.sort_order,
        locale: archive.locale || 'de',
      });
      return mapEventArchiveRecord(data) as EventArchive;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_archives'] });
    },
  });
}

export function useUpdateEventArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Omit<EventArchive, 'created_at'>> & { id: string }) => {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.year !== undefined) payload.year = updates.year;
      if (updates.description !== undefined) payload.description = updates.description || '';
      if (updates.album_id !== undefined) payload.albumId = updates.album_id || null;
      if (updates.sort_order !== undefined) payload.sortOrder = updates.sort_order;
      if (updates.locale !== undefined) payload.locale = updates.locale;

      const data = await pb.collection('eventArchive').update(id, payload);
      return mapEventArchiveRecord(data) as EventArchive;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_archives'] });
    },
  });
}

export function useDeleteEventArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection('eventArchive').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_archives'] });
    },
  });
}

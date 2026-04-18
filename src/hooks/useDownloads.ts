import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, Download, ensureCmsSession, listAllRecords, mapDownloadRecord } from '@/integrations/pocketbase/client';
import { getSafeTimestamp } from '@/lib/date';

export interface DownloadInput {
  title: string;
  description?: string | null;
  category?: string | null;
  file?: File | null;
}

export interface UpdateDownloadInput extends DownloadInput {
  id: string;
}

export function useDownloads() {
  return useQuery({
    queryKey: ['downloads'],
    queryFn: async () => {
      const data = await listAllRecords('downloads');
      return (data.map(mapDownloadRecord) as Download[]).sort(
        (a, b) => getSafeTimestamp(b.created_at) - getSafeTimestamp(a.created_at),
      );
    },
  });
}

export function useDownload(id: string) {
  return useQuery({
    queryKey: ['downloads', id],
    queryFn: async () => {
      const data = await pb.collection('downloads').getOne(id);
      return mapDownloadRecord(data) as Download;
    },
    enabled: !!id,
  });
}

export function useCreateDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (download: DownloadInput) => {
      await ensureCmsSession();

      const data = await pb.collection('downloads').create({
        title: download.title,
        description: download.description || '',
        file: download.file,
        category: download.category || '',
      });
      return mapDownloadRecord(data) as Download;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    },
  });
}

export function useUpdateDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file, ...updates }: UpdateDownloadInput) => {
      await ensureCmsSession();

      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description || '';
      if (updates.category !== undefined) payload.category = updates.category || '';
      if (file) payload.file = file;

      const data = await pb.collection('downloads').update(id, payload);
      return mapDownloadRecord(data) as Download;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      queryClient.invalidateQueries({ queryKey: ['downloads', data.id] });
    },
  });
}

export function useDeleteDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await ensureCmsSession();
      await pb.collection('downloads').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    },
  });
}

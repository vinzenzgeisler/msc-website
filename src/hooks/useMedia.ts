import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, MediaAlbum, MediaFile, buildSlug, flattenMediaFiles, listAllRecords, mapMediaAlbumRecord } from '@/integrations/pocketbase/client';
import { getSafeTimestamp } from '@/lib/date';

export function useMediaAlbums() {
  return useQuery({
    queryKey: ['media_albums'],
    queryFn: async () => {
      const data = await listAllRecords('mediaAlbums');
      return (data.map(mapMediaAlbumRecord) as MediaAlbum[]).sort(
        (a, b) => getSafeTimestamp(b.created_at) - getSafeTimestamp(a.created_at),
      );
    },
  });
}

export function useMediaFiles(albumId?: string) {
  return useQuery({
    queryKey: ['media_files', albumId],
    queryFn: async () => {
      const records = albumId
        ? [await pb.collection('mediaAlbums').getOne(albumId)]
        : await listAllRecords('mediaAlbums');

      return records.flatMap((record) => flattenMediaFiles(record)) as MediaFile[];
    },
  });
}

export function useCreateMediaAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (album: Omit<MediaAlbum, 'id' | 'created_at'>) => {
      const data = await pb.collection('mediaAlbums').create({
        title: album.title,
        slug: buildSlug(album.slug || album.title),
        description: album.description || '',
        locale: album.locale || 'de',
      });
      return mapMediaAlbumRecord(data) as MediaAlbum;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media_albums'] });
    },
  });
}

export function useUploadMediaFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, albumId, altText }: { file: File; albumId?: string; altText?: string }) => {
      if (albumId) {
        const album = await pb.collection('mediaAlbums').getOne(albumId);
        await pb.collection('mediaAlbums').update(albumId, {
          'images+': [file],
          ...(album.coverImage ? {} : { coverImage: file }),
        });
        const updated = await pb.collection('mediaAlbums').getOne(albumId);
        const files = flattenMediaFiles(updated);
        return files[files.length - 1] as MediaFile;
      }

      const title = altText || file.name.replace(/\.[^.]+$/, '');
      const created = await pb.collection('mediaAlbums').create({
        title,
        slug: `${buildSlug(title)}-${Date.now()}`,
        description: '',
        locale: 'de',
        coverImage: file,
        images: [file],
      });

      return flattenMediaFiles(created)[0] as MediaFile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media_files'] });
      queryClient.invalidateQueries({ queryKey: ['media_albums'] });
    },
  });
}

export function useDeleteMediaFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: MediaFile) => {
      if (!file.album_id) return;

      const album = await pb.collection('mediaAlbums').getOne(file.album_id);
      const payload: Record<string, unknown> = { 'images-': [file.file_name] };

      if (album.coverImage === file.file_name) {
        payload['coverImage-'] = file.file_name;
      }

      await pb.collection('mediaAlbums').update(file.album_id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media_files'] });
      queryClient.invalidateQueries({ queryKey: ['media_albums'] });
    },
  });
}

export function useDeleteMediaAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection('mediaAlbums').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media_albums'] });
      queryClient.invalidateQueries({ queryKey: ['media_files'] });
    },
  });
}

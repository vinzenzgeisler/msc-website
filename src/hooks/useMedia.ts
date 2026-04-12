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
      // Files from mediaAlbums
      const albumRecords = albumId
        ? [await pb.collection('mediaAlbums').getOne(albumId)]
        : await listAllRecords('mediaAlbums');
      const albumFiles = albumRecords.flatMap((record) => flattenMediaFiles(record)) as MediaFile[];

      // Also fetch standalone files from the "media" collection (rich-text uploads)
      if (!albumId) {
        try {
          const mediaRecords = await listAllRecords('media');
          const standaloneFiles: MediaFile[] = mediaRecords.map((record: any) => ({
            id: record.id,
            album_id: null,
            file_url: pb.files.getURL(record, record.file),
            file_name: record.file || '',
            file_type: typeof record.file === 'string' && record.file.includes('.')
              ? record.file.split('.').pop() || null
              : null,
            file_size: null,
            alt_text: record.alt || null,
            created_at: record.created,
          }));
          return [...albumFiles, ...standaloneFiles].sort(
            (a, b) => getSafeTimestamp(b.created_at) - getSafeTimestamp(a.created_at),
          );
        } catch (e) {
          // media collection might not exist yet
          console.warn('Could not fetch media collection:', e);
        }
      }

      return albumFiles;
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

      // Upload to the standalone "media" collection
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', altText || file.name.replace(/\.[^.]+$/, ''));

      const record = await pb.collection('media').create(formData);
      return {
        id: record.id,
        album_id: null,
        file_url: pb.files.getURL(record, record.file),
        file_name: record.file || '',
        file_type: typeof record.file === 'string' && record.file.includes('.') ? record.file.split('.').pop() || null : null,
        file_size: null,
        alt_text: (record as any).alt || null,
        created_at: record.created,
      } as MediaFile;
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
      if (!file.album_id) {
        // Standalone media file – delete from "media" collection
        await pb.collection('media').delete(file.id);
        return;
      }

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

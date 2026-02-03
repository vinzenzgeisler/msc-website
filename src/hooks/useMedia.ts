import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, MediaAlbum, MediaFile } from '@/integrations/supabase/client';

export function useMediaAlbums() {
  return useQuery({
    queryKey: ['media_albums'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_albums')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MediaAlbum[];
    },
  });
}

export function useMediaFiles(albumId?: string) {
  return useQuery({
    queryKey: ['media_files', albumId],
    queryFn: async () => {
      let query = supabase
        .from('media_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (albumId) {
        query = query.eq('album_id', albumId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as MediaFile[];
    },
  });
}

export function useCreateMediaAlbum() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (album: Omit<MediaAlbum, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('media_albums')
        .insert(album)
        .select()
        .single();
      
      if (error) throw error;
      return data as MediaAlbum;
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
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);
      
      if (uploadError) {
        // Provide more detailed error messages
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
          throw new Error('Storage-Bucket "media" nicht gefunden. Bitte im Supabase Dashboard erstellen.');
        }
        if (uploadError.message.includes('policy') || uploadError.message.includes('security')) {
          throw new Error('Keine Upload-Berechtigung. Bitte RLS-Policies im Supabase Dashboard prüfen.');
        }
        throw new Error(`Upload-Fehler: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      // Save metadata to database
      const { data, error } = await supabase
        .from('media_files')
        .insert({
          album_id: albumId || null,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          alt_text: altText || null,
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Datenbank-Fehler: ${error.message}`);
      }
      return data as MediaFile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media_files'] });
    },
  });
}

export function useDeleteMediaFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: MediaFile) => {
      // Extract file path from URL
      const url = new URL(file.file_url);
      const pathParts = url.pathname.split('/');
      const storagePath = pathParts.slice(pathParts.indexOf('media') + 1).join('/');
      
      // Delete from storage
      if (storagePath) {
        await supabase.storage
          .from('media')
          .remove([storagePath]);
      }
      
      // Delete from database
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', file.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media_files'] });
    },
  });
}

export function useDeleteMediaAlbum() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('media_albums')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media_albums'] });
    },
  });
}

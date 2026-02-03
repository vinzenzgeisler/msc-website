import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Download } from '@/integrations/supabase/client';

export function useDownloads() {
  return useQuery({
    queryKey: ['downloads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Download[];
    },
  });
}

export function useDownload(id: string) {
  return useQuery({
    queryKey: ['downloads', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Download;
    },
    enabled: !!id,
  });
}

export function useCreateDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (download: Omit<Download, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('downloads')
        .insert(download)
        .select()
        .single();
      
      if (error) throw error;
      return data as Download;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    },
  });
}

export function useUpdateDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Download> & { id: string }) => {
      const { data, error } = await supabase
        .from('downloads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Download;
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
      const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    },
  });
}

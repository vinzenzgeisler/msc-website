import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Sponsor } from '@/integrations/supabase/client';

export function useSponsors() {
  return useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Sponsor[];
    },
  });
}

export function useSponsor(id: string) {
  return useQuery({
    queryKey: ['sponsors', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Sponsor;
    },
    enabled: !!id,
  });
}

export function useCreateSponsor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sponsor: Omit<Sponsor, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('sponsors')
        .insert(sponsor)
        .select()
        .single();
      
      if (error) throw error;
      return data as Sponsor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

export function useUpdateSponsor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sponsor> & { id: string }) => {
      const { data, error } = await supabase
        .from('sponsors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Sponsor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['sponsors', data.id] });
    },
  });
}

export function useDeleteSponsor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

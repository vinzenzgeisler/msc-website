import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Profile, UserRole } from '@/integrations/supabase/client';

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profiles', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ user_id, ...updates }: Partial<Profile> & { user_id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user_id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles', data.user_id] });
    },
  });
}

// Note: Creating users requires Supabase Admin API or Edge Function
// This is a placeholder for the invite flow
export function useInviteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, full_name, role }: { email: string; full_name: string; role: UserRole }) => {
      // For now, this will need to be handled via Supabase Dashboard or Edge Function
      // as creating users requires admin privileges
      throw new Error('Benutzer-Einladungen müssen über das Supabase Dashboard erfolgen');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Note: Deleting a profile should also delete the auth user
      // This typically requires an Edge Function with admin privileges
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

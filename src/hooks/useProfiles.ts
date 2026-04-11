import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, Profile, UserRole, listAllRecords, mapProfileRecord } from '@/integrations/pocketbase/client';
import { getSafeTimestamp } from '@/lib/date';

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const data = await listAllRecords('cms_users');
      return (data.map(mapProfileRecord) as Profile[]).sort(
        (a, b) => getSafeTimestamp(b.created_at) - getSafeTimestamp(a.created_at),
      );
    },
  });
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profiles', userId],
    queryFn: async () => {
      const data = await pb.collection('cms_users').getOne(userId);
      return mapProfileRecord(data) as Profile;
    },
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user_id, ...updates }: Partial<Profile> & { user_id: string }) => {
      const data = await pb.collection('cms_users').update(user_id, {
        name: updates.full_name,
        role: updates.role,
        isActive: updates.is_active,
      });
      return mapProfileRecord(data) as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles', data.user_id] });
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, full_name, role }: { email: string; full_name: string; role: UserRole }) => {
      const randomPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
      const data = await pb.collection('cms_users').create({
        email,
        password: randomPassword,
        passwordConfirm: randomPassword,
        name: full_name,
        role,
        isActive: true,
      });
      return mapProfileRecord(data) as Profile;
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
      await pb.collection('cms_users').delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

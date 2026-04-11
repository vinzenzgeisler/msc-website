import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, Sponsor, listAllRecords, mapSponsorRecord } from '@/integrations/pocketbase/client';
import { getSafeTimestamp } from '@/lib/date';

export function useSponsors() {
  return useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const data = await listAllRecords('sponsors');
      return (data.map(mapSponsorRecord) as Sponsor[]).sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return getSafeTimestamp(b.created_at) - getSafeTimestamp(a.created_at);
      });
    },
  });
}

export function useSponsor(id: string) {
  return useQuery({
    queryKey: ['sponsors', id],
    queryFn: async () => {
      const data = await pb.collection('sponsors').getOne(id);
      return mapSponsorRecord(data) as Sponsor;
    },
    enabled: !!id,
  });
}

export function useCreateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sponsor: Omit<Sponsor, 'id' | 'created_at'> & { logoFile?: File | null }) => {
      const payload: Record<string, unknown> = {
        name: sponsor.name,
        website: sponsor.website || '',
        tier: sponsor.tier,
        active: sponsor.active,
        sortOrder: sponsor.sort_order,
      };

      if (sponsor.logoFile) {
        payload.logo = sponsor.logoFile;
      }

      const data = await pb.collection('sponsors').create(payload);
      return mapSponsorRecord(data) as Sponsor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

export function useUpdateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, logoFile, ...updates }: Partial<Sponsor> & { id: string; logoFile?: File | null }) => {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.website !== undefined) payload.website = updates.website || '';
      if (updates.tier !== undefined) payload.tier = updates.tier;
      if (updates.active !== undefined) payload.active = updates.active;
      if (updates.sort_order !== undefined) payload.sortOrder = updates.sort_order;
      if (logoFile) payload.logo = logoFile;

      const data = await pb.collection('sponsors').update(id, payload);
      return mapSponsorRecord(data) as Sponsor;
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
      await pb.collection('sponsors').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

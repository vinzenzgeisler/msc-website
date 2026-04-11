import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAllRecords, pb } from '@/integrations/pocketbase/client';

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  sort_order: number;
}

function mapBoardMember(item: any): BoardMember {
  return {
    id: item.id,
    name: item.name,
    role: item.role,
    photo_url: item.photo ? pb.files.getURL(item, item.photo) : null,
    email: item.email || null,
    phone: item.phone || null,
    sort_order: Number(item.sortOrder || 0),
  };
}

export function useBoardMembers() {
  return useQuery({
    queryKey: ['board_members'],
    queryFn: async () => {
      const data = await listAllRecords('boardMembers');
      return data.map(mapBoardMember).sort((a, b) => a.sort_order - b.sort_order) as BoardMember[];
    },
  });
}

export function useCreateBoardMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: {
      name: string;
      role: string;
      email?: string | null;
      phone?: string | null;
      sort_order?: number;
      photoFile?: File | null;
    }) => {
      const payload: Record<string, unknown> = {
        name: member.name,
        role: member.role,
        email: member.email || '',
        phone: member.phone || '',
        sortOrder: member.sort_order || 0,
      };

      if (member.photoFile) payload.photo = member.photoFile;

      const data = await pb.collection('boardMembers').create(payload);
      return mapBoardMember(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board_members'] });
    },
  });
}

export function useUpdateBoardMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member: {
      id: string;
      name?: string;
      role?: string;
      email?: string | null;
      phone?: string | null;
      sort_order?: number;
      photoFile?: File | null;
    }) => {
      const payload: Record<string, unknown> = {};
      if (member.name !== undefined) payload.name = member.name;
      if (member.role !== undefined) payload.role = member.role;
      if (member.email !== undefined) payload.email = member.email || '';
      if (member.phone !== undefined) payload.phone = member.phone || '';
      if (member.sort_order !== undefined) payload.sortOrder = member.sort_order;
      if (member.photoFile) payload.photo = member.photoFile;

      const data = await pb.collection('boardMembers').update(member.id, payload);
      return mapBoardMember(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board_members'] });
    },
  });
}

export function useDeleteBoardMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection('boardMembers').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board_members'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, CalendarEvent } from '@/integrations/supabase/client';

export function useCalendarEvents() {
  return useQuery({
    queryKey: ['calendar_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_dt', { ascending: true });
      
      if (error) throw error;
      return data as CalendarEvent[];
    },
  });
}

export function useCalendarEvent(id: string) {
  return useQuery({
    queryKey: ['calendar_events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as CalendarEvent;
    },
    enabled: !!id,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
      queryClient.invalidateQueries({ queryKey: ['main_event'] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Omit<CalendarEvent, 'created_at' | 'updated_at'>> & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar_events', data.id] });
      queryClient.invalidateQueries({ queryKey: ['main_event'] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
    },
  });
}

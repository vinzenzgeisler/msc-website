import { useQuery } from '@tanstack/react-query';
import { supabase, CalendarEvent } from '@/integrations/supabase/client';

export function useMainEvent() {
  return useQuery({
    queryKey: ['main_event'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('is_main_event', true)
        .eq('published', true)
        .gte('start_dt', new Date().toISOString())
        .order('start_dt', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as CalendarEvent | null;
    },
  });
}

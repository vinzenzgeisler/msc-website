import { useQuery } from '@tanstack/react-query';
import { CalendarEvent, listAllRecords, mapCalendarEventRecord } from '@/integrations/pocketbase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { getSafeTimestamp } from '@/lib/date';

export function useMainEvent() {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['main_event', locale],
    queryFn: async () => {
      const data = await listAllRecords('calendarEvents');
      const events = data
        .map(mapCalendarEventRecord)
        .filter((event): event is CalendarEvent => event.published && event.is_main_event)
        .sort((a, b) => getSafeTimestamp(a.start_dt) - getSafeTimestamp(b.start_dt));

      return (
        events.find((event) => event.locale === locale) ??
        events.find((event) => event.locale === 'de') ??
        null
      );
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { CalendarEvent, listAllRecords, mapCalendarEventRecord } from '@/integrations/pocketbase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { getSafeTimestamp } from '@/lib/date';

export function selectLocalizedMainEvent(events: CalendarEvent[], locale: string) {
  const published = events
    .filter((event) => event.published)
    .sort((a, b) => getSafeTimestamp(a.start_dt) - getSafeTimestamp(b.start_dt));
  const mainEvents = published.filter((event) => event.is_main_event);
  const exactMain = mainEvents.find((event) => event.locale === locale);
  const germanMain = mainEvents.find((event) => event.locale === 'de');

  if (exactMain || germanMain) return exactMain ?? germanMain ?? null;

  // A translated calendar sibling can occasionally lose its main-event flag in the CMS.
  // Keep the localized record, but derive its identity from a flagged sibling with the same slug.
  const mainSource = mainEvents[0];
  if (!mainSource) return null;
  const localizedSibling = published.find(
    (event) => event.slug === mainSource.slug && event.locale === locale,
  );
  const germanSibling = published.find(
    (event) => event.slug === mainSource.slug && event.locale === 'de',
  );

  return localizedSibling ?? germanSibling ?? mainSource;
}

export function useMainEvent() {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['main_event', locale],
    queryFn: async () => {
      const data = await listAllRecords('calendarEvents');
      const events = data
        .map(mapCalendarEventRecord)
        .filter((event): event is CalendarEvent => Boolean(event));

      return selectLocalizedMainEvent(events, locale);
    },
  });
}

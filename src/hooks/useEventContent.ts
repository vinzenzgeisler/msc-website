import { useQuery } from '@tanstack/react-query';
import {
  EventInfo,
  EventSchedule,
  ParticipantClass,
  StructuredEventScheduleEntry,
  listAllRecords,
  mapEventInfoRecord,
  mapEventScheduleRecord,
  mapParticipantClassRecord,
  mapStructuredEventScheduleEntryRecord,
} from '@/integrations/pocketbase/client';
import { useLanguage } from '@/i18n/LanguageContext';

async function safeList(collectionName: string) {
  try {
    return await listAllRecords(collectionName);
  } catch {
    return [];
  }
}

export function useEventContent(eventId?: string) {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['event_content', eventId, locale],
    enabled: !!eventId,
    queryFn: async () => {
      const [scheduleRecords, scheduleEntryRecords, infoRecords, classRecords] = await Promise.all([
        safeList('eventSchedules'),
        safeList('eventScheduleEntries'),
        safeList('eventInfos'),
        safeList('participantClasses'),
      ]);

      const scheduleEntries = (scheduleEntryRecords
        .filter((item: any) => item.event === eventId && item.locale === locale)
        .map(mapStructuredEventScheduleEntryRecord) as StructuredEventScheduleEntry[])
        .sort((a, b) => a.sort_order - b.sort_order);

      return {
        schedules: (scheduleRecords
          .filter((item: any) => item.event === eventId && item.locale === locale)
          .map(mapEventScheduleRecord) as EventSchedule[])
          .map((schedule) => {
            const legacyEntries = (schedule.entries || []).map((entry, index) => ({
              id: `${schedule.id}-${index}`,
              time: entry.time,
              title: entry.title,
            }));
            const linkedEntries = scheduleEntries.filter((entry) => entry.schedule_day === schedule.id);
            return {
              ...schedule,
              entries:
                linkedEntries.length > 0
                  ? linkedEntries.map((entry) => ({
                      id: entry.id,
                      time: entry.time_label,
                      title: entry.title,
                    }))
                  : legacyEntries,
            };
          })
          .sort((a, b) => a.day_number - b.day_number),
        infos: (infoRecords
          .filter((item: any) => item.event === eventId && item.locale === locale)
          .map(mapEventInfoRecord) as EventInfo[]).sort((a, b) => a.sort_order - b.sort_order),
        classes: (classRecords
          .filter((item: any) => item.event === eventId && item.locale === locale)
          .map(mapParticipantClassRecord) as ParticipantClass[]).sort((a, b) => a.sort_order - b.sort_order),
      };
    },
  });
}

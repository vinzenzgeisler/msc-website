import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  EventInfo,
  EventSchedule,
  ParticipantClass,
  StructuredEventScheduleEntry,
  ensureCmsSession,
  listAllRecords,
  mapEventInfoRecord,
  mapEventScheduleRecord,
  mapParticipantClassRecord,
  mapStructuredEventScheduleEntryRecord,
  pb,
} from '@/integrations/pocketbase/client';
import { useLanguage } from '@/i18n/LanguageContext';

async function safeList(collectionName: string) {
  try {
    return await listAllRecords(collectionName);
  } catch {
    return [];
  }
}

function resolveLocalizedList<T extends { locale: string }>(items: T[], locale: string) {
  const exact = items.filter((item) => item.locale === locale);
  if (exact.length > 0) return exact;
  return items.filter((item) => item.locale === 'de');
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

      const scheduleEntries = resolveLocalizedList((scheduleEntryRecords
        .filter((item: any) => item.event === eventId)
        .map(mapStructuredEventScheduleEntryRecord) as StructuredEventScheduleEntry[]), locale)
        .sort((a, b) => a.sort_order - b.sort_order);

      return {
        schedules: resolveLocalizedList((scheduleRecords
          .filter((item: any) => item.event === eventId)
          .map(mapEventScheduleRecord) as EventSchedule[]), locale)
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
        infos: resolveLocalizedList((infoRecords
          .filter((item: any) => item.event === eventId)
          .map(mapEventInfoRecord) as EventInfo[]), locale).sort((a, b) => a.sort_order - b.sort_order),
        classes: resolveLocalizedList((classRecords
          .filter((item: any) => item.event === eventId)
          .map(mapParticipantClassRecord) as ParticipantClass[]), locale).sort((a, b) => a.sort_order - b.sort_order),
      };
    },
  });
}

export function useEventInfoAdmin(eventId?: string, section?: string) {
  return useQuery({
    queryKey: ['event_info_admin', eventId, section],
    enabled: Boolean(eventId),
    queryFn: async () => {
      const infoRecords = await safeList('eventInfos');
      return (infoRecords
        .filter((item: any) => item.event === eventId && (!section || item.section === section))
        .map(mapEventInfoRecord) as EventInfo[])
        .sort((a, b) => a.sort_order - b.sort_order || a.locale.localeCompare(b.locale));
    },
  });
}

export function useUpsertEventInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      event: string;
      section: string;
      locale: string;
      title?: string | null;
      content?: string | null;
      sort_order?: number;
    }) => {
      await ensureCmsSession();

      const title = String(payload.title || '').trim();
      const content = String(payload.content || '').trim();
      const all = await listAllRecords('eventInfos');
      const existing = all.find(
        (item: any) =>
          item.event === payload.event
          && item.section === payload.section
          && item.locale === payload.locale,
      );

      if (!title && !content) {
        if (existing) {
          await pb.collection('eventInfos').delete(existing.id);
        }
        return null;
      }

      const data: Record<string, unknown> = {
        event: payload.event,
        section: payload.section,
        locale: payload.locale,
        title,
        content,
        sortOrder: payload.sort_order ?? 0,
      };

      if (existing) {
        const updated = await pb.collection('eventInfos').update(existing.id, data);
        return mapEventInfoRecord(updated);
      }

      const created = await pb.collection('eventInfos').create(data);
      return mapEventInfoRecord(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_content'] });
      queryClient.invalidateQueries({ queryKey: ['event_info_admin'] });
    },
  });
}

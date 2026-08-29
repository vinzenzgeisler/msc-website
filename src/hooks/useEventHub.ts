import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/i18n/LanguageContext';
import { EventLiveNotice, listAllRecords, mapEventLiveNoticeRecord } from '@/integrations/pocketbase/client';
import type { RecordModel } from 'pocketbase';

export function useEventLiveNotices(eventId?: string) {
  const { locale } = useLanguage();
  return useQuery({
    queryKey: ['event_live_notices', eventId, locale],
    enabled: Boolean(eventId),
    refetchInterval: 60_000,
    queryFn: async () => {
      try {
        const now = Date.now();
        const all = (await listAllRecords('eventLiveNotices'))
          .filter((record: RecordModel) => record.event === eventId)
          .map(mapEventLiveNoticeRecord) as EventLiveNotice[];
        const localized = all.some((notice) => notice.locale === locale)
          ? all.filter((notice) => notice.locale === locale)
          : all.filter((notice) => notice.locale === 'de');
        return localized.filter((notice) => notice.active
          && (!notice.starts_at || new Date(notice.starts_at).getTime() <= now)
          && (!notice.ends_at || new Date(notice.ends_at).getTime() >= now))
          .sort((a, b) => a.sort_order - b.sort_order);
      } catch {
        return [];
      }
    },
  });
}

import type { CalendarEvent } from '@/integrations/pocketbase/client';

export function getCalendarEventDetailPath(slug?: string | null) {
  const normalizedSlug = String(slug || '').trim();
  return normalizedSlug ? `/calendar/${normalizedSlug}` : null;
}

export function getCalendarEventClickTarget(
  event: Pick<CalendarEvent, 'is_main_event' | 'detail_url' | 'slug'>,
) {
  if (event.is_main_event) {
    return '/old';
  }

  const manualTarget = String(event.detail_url || '').trim();
  if (manualTarget) {
    return manualTarget;
  }

  return getCalendarEventDetailPath(event.slug);
}

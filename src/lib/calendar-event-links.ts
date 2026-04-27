import type { CalendarEvent } from '@/integrations/pocketbase/client';

export function getCalendarEventDetailPath(slug?: string | null) {
  const normalizedSlug = String(slug || '').trim();
  return normalizedSlug ? `/calendar/${normalizedSlug}` : null;
}

export function getCalendarEventClickTarget(
  event: Pick<CalendarEvent, 'is_main_event' | 'detail_url' | 'slug'>,
) {
  if (event.is_main_event) {
    return '/event';
  }

  const manualTarget = String(event.detail_url || '').trim();
  if (manualTarget) {
    return manualTarget;
  }

  return getCalendarEventDetailPath(event.slug);
}

export function hasCalendarEventTime(value?: string | null) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
}

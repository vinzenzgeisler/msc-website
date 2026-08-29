import type { CalendarEvent, EventSchedule, EventScheduleEntry } from '@/integrations/pocketbase/client';

export type EventPhase = 'pre' | 'live' | 'post';
export type LiveScheduleState = 'before_day' | 'running' | 'pause' | 'between_days';

export interface LiveScheduleSnapshot {
  state: LiveScheduleState;
  day: EventSchedule | null;
  current: EventScheduleEntry | null;
  next: EventScheduleEntry | null;
}

const timestamp = (value?: string | null) => value ? new Date(value).getTime() : Number.NaN;

export function resolveEventPhase(now: Date, event: Pick<CalendarEvent, 'phase_override' | 'live_start_dt' | 'start_dt' | 'end_dt'>): EventPhase {
  if (event.phase_override && event.phase_override !== 'auto') return event.phase_override;
  const current = now.getTime();
  const liveStart = timestamp(event.live_start_dt || event.start_dt);
  const end = timestamp(event.end_dt);
  if (Number.isFinite(liveStart) && current < liveStart) return 'pre';
  if (!Number.isFinite(end) || current <= end) return 'live';
  return 'post';
}

function sortedEntries(day: EventSchedule) {
  return [...day.entries].sort((a, b) => timestamp(a.start_dt) - timestamp(b.start_dt));
}

export function resolveLiveScheduleState(now: Date, schedules: EventSchedule[]): LiveScheduleSnapshot {
  const currentTime = now.getTime();
  const days = [...schedules]
    .filter((day) => day.entries.some((entry) => Number.isFinite(timestamp(entry.start_dt))))
    .sort((a, b) => timestamp(a.entries[0]?.start_dt) - timestamp(b.entries[0]?.start_dt));

  if (!days.length) return { state: 'before_day', day: null, current: null, next: null };

  const nextDay = days.find((day) => timestamp(sortedEntries(day)[0]?.start_dt) > currentTime);
  const activeDay = [...days].reverse().find((day) => timestamp(sortedEntries(day)[0]?.start_dt) <= currentTime);

  if (!activeDay) {
    const entries = sortedEntries(nextDay || days[0]);
    return { state: 'before_day', day: nextDay || days[0], current: null, next: entries[0] || null };
  }

  const entries = sortedEntries(activeDay);
  const current = entries.find((entry) => {
    const start = timestamp(entry.start_dt);
    const end = timestamp(entry.end_dt);
    return start <= currentTime && (!Number.isFinite(end) || currentTime < end);
  }) || null;
  const next = entries.find((entry) => timestamp(entry.start_dt) > currentTime) || null;

  if (current) {
    return {
      state: current.entry_type === 'pause' ? 'pause' : 'running',
      day: activeDay,
      current,
      next,
    };
  }
  if (next) return { state: 'pause', day: activeDay, current: null, next };
  return { state: 'between_days', day: activeDay, current: null, next: nextDay ? sortedEntries(nextDay)[0] || null : null };
}

export function formatCountdown(target: string, now: Date) {
  const remaining = Math.max(0, timestamp(target) - now.getTime());
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

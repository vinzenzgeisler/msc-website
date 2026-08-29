import { describe, expect, it } from 'vitest';
import { resolveEventPhase, resolveLiveScheduleState } from './event-hub';
import type { CalendarEvent, EventSchedule } from '@/integrations/pocketbase/client';

const event = {
  phase_override: 'auto', live_start_dt: '2026-09-12T05:00:00Z', start_dt: '2026-09-12T06:00:00Z', end_dt: '2026-09-13T16:00:00Z',
} as CalendarEvent;

const schedules = [{
  id: 'sat', event: 'event', day_label: 'Samstag', day_number: 1, locale: 'de', date: '2026-09-12', after_program_note: 'Live-Musik',
  entries: [
    { id: 'a', time: '08:00', title: 'Klasse 1', start_dt: '2026-09-12T06:00:00Z', end_dt: '2026-09-12T06:20:00Z', entry_type: 'program' },
    { id: 'p', time: '08:20', title: 'Pause', start_dt: '2026-09-12T06:20:00Z', end_dt: '2026-09-12T06:30:00Z', entry_type: 'pause' },
    { id: 'b', time: '08:30', title: 'Klasse 2', start_dt: '2026-09-12T06:30:00Z', end_dt: '2026-09-12T06:50:00Z', entry_type: 'program' },
  ],
}] as EventSchedule[];

describe('event phase', () => {
  it('switches at exact live and post boundaries', () => {
    expect(resolveEventPhase(new Date('2026-09-12T04:59:59Z'), event)).toBe('pre');
    expect(resolveEventPhase(new Date('2026-09-12T05:00:00Z'), event)).toBe('live');
    expect(resolveEventPhase(new Date('2026-09-13T16:00:00Z'), event)).toBe('live');
    expect(resolveEventPhase(new Date('2026-09-13T16:00:01Z'), event)).toBe('post');
  });
  it('honors an editorial override', () => expect(resolveEventPhase(new Date('2025-01-01'), { ...event, phase_override: 'post' })).toBe('post'));
});

describe('live schedule', () => {
  it('covers before, running, pause and after-program states', () => {
    expect(resolveLiveScheduleState(new Date('2026-09-12T05:59:00Z'), schedules).state).toBe('before_day');
    expect(resolveLiveScheduleState(new Date('2026-09-12T06:00:00Z'), schedules).state).toBe('running');
    expect(resolveLiveScheduleState(new Date('2026-09-12T06:20:00Z'), schedules).state).toBe('pause');
    expect(resolveLiveScheduleState(new Date('2026-09-12T07:00:00Z'), schedules).state).toBe('between_days');
  });
});

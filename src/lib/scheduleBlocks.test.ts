import { describe, expect, it } from 'vitest';
import { blockTimeRange, groupEntriesByBlock, resolveActiveBlock } from './scheduleBlocks';
import type { EventScheduleEntry } from '@/integrations/pocketbase/client';

const entries: EventScheduleEntry[] = [
  { id: 'a', time: '08:00', title: 'Klasse 1', start_dt: '2026-09-12T06:00:00Z', end_dt: '2026-09-12T06:20:00Z', program_block: 'run_1' },
  { id: 'b', time: '08:20', title: 'Klasse 2', start_dt: '2026-09-12T06:20:00Z', end_dt: '2026-09-12T06:40:00Z', program_block: 'run_1' },
  { id: 'c', time: '11:00', title: 'Klasse 3', start_dt: '2026-09-12T09:00:00Z', end_dt: '2026-09-12T09:20:00Z', program_block: 'run_2' },
  { id: 'legacy', time: '13:00', title: 'Ohne Block' },
];

describe('groupEntriesByBlock', () => {
  it('groups by program_block, defaulting missing entries to other', () => {
    const groups = groupEntriesByBlock(entries);
    expect(groups.run_1.map((e) => e.id)).toEqual(['a', 'b']);
    expect(groups.run_2.map((e) => e.id)).toEqual(['c']);
    expect(groups.other.map((e) => e.id)).toEqual(['legacy']);
  });
});

describe('blockTimeRange', () => {
  it('spans from the earliest start to the latest end', () => {
    expect(blockTimeRange(groupEntriesByBlock(entries).run_1)).toEqual({
      start: '2026-09-12T06:00:00Z',
      end: '2026-09-12T06:40:00Z'
    });
  });
  it('returns nulls when nothing is scheduled', () => {
    expect(blockTimeRange([])).toEqual({ start: null, end: null });
  });
});

describe('resolveActiveBlock', () => {
  it('picks the block containing the current entry', () => {
    expect(resolveActiveBlock(entries, 'c', new Date('2026-09-12T09:05:00Z'))).toBe('run_2');
  });
  it('falls back to the next upcoming block when nothing is currently running', () => {
    expect(resolveActiveBlock(entries, null, new Date('2026-09-12T07:00:00Z'))).toBe('run_2');
  });
  it('falls back to the first non-empty block once everything has finished', () => {
    expect(resolveActiveBlock(entries, null, new Date('2026-09-13T00:00:00Z'))).toBe('run_1');
  });
});

import type { EventScheduleEntry } from '@/integrations/pocketbase/client';

export type ProgramBlock = 'run_1' | 'run_2' | 'other';

const timestamp = (value?: string | null) => (value ? new Date(value).getTime() : Number.NaN);

/** Entries without an explicit block default to "other" so older data keeps rendering. */
export function blockOf(entry: EventScheduleEntry): ProgramBlock {
  return entry.program_block ?? 'other';
}

export function groupEntriesByBlock(entries: EventScheduleEntry[]): Record<ProgramBlock, EventScheduleEntry[]> {
  const groups: Record<ProgramBlock, EventScheduleEntry[]> = { run_1: [], run_2: [], other: [] };
  for (const entry of entries) {
    groups[blockOf(entry)].push(entry);
  }
  return groups;
}

export interface BlockTimeRange {
  start: string | null;
  end: string | null;
}

export function blockTimeRange(entries: EventScheduleEntry[]): BlockTimeRange {
  const withStart = entries.filter((e) => Number.isFinite(timestamp(e.start_dt)));
  if (withStart.length === 0) return { start: null, end: null };
  const sorted = [...withStart].sort((a, b) => timestamp(a.start_dt) - timestamp(b.start_dt));
  const first = sorted[0];
  const last = [...withStart].sort((a, b) => timestamp(b.end_dt || b.start_dt) - timestamp(a.end_dt || a.start_dt))[0];
  return { start: first.start_dt ?? null, end: last.end_dt ?? last.start_dt ?? null };
}

/** The block containing `currentEntryId` is "active"; with no current entry, the next upcoming block is active. */
export function resolveActiveBlock(
  entries: EventScheduleEntry[],
  currentEntryId: string | null | undefined,
  now: Date
): ProgramBlock {
  if (currentEntryId) {
    const current = entries.find((e) => e.id === currentEntryId);
    if (current) return blockOf(current);
  }
  const groups = groupEntriesByBlock(entries);
  const currentTime = now.getTime();
  const order: ProgramBlock[] = ['run_1', 'run_2', 'other'];
  for (const block of order) {
    const range = blockTimeRange(groups[block]);
    if (range.end && timestamp(range.end) >= currentTime) return block;
  }
  return order.find((block) => groups[block].length > 0) ?? 'other';
}

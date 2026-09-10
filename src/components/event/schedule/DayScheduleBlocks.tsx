import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Music2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import type { EventSchedule, EventScheduleEntry } from '@/integrations/pocketbase/client';
import { blockTimeRange, groupEntriesByBlock, resolveActiveBlock, type ProgramBlock } from '@/lib/scheduleBlocks';

const BLOCK_LABEL: Record<ProgramBlock, string> = {
  run_1: '1. Durchgang',
  run_2: '2. Durchgang',
  other: 'Weiteres Programm'
};

function formatTimeRange(range: { start: string | null; end: string | null }): string {
  if (!range.start) return '';
  const start = format(new Date(range.start), 'HH:mm');
  if (!range.end) return start;
  return `${start}–${format(new Date(range.end), 'HH:mm')}`;
}

function EntryRow({ entry, active }: { entry: EventScheduleEntry; active: boolean }) {
  return (
    <div
      id={active ? 'schedule-current-entry' : undefined}
      className={`grid grid-cols-[5.25rem_1fr] gap-4 border-b border-border py-4 last:border-0 md:grid-cols-[8rem_1fr_auto] ${active ? '-mx-5 bg-primary px-5 text-primary-foreground md:-mx-8 md:px-8' : entry.entry_type === 'pause' ? 'text-muted-foreground' : ''}`}
    >
      <time className="font-mono text-sm font-bold">
        {entry.time}
        {entry.end_dt ? `–${format(new Date(entry.end_dt), 'HH:mm')}` : ''}
      </time>
      <div>
        <p className="font-semibold">{entry.title}</p>
        {entry.subtitle && (
          <p className={`text-sm ${active ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{entry.subtitle}</p>
        )}
      </div>
      {active && <span className="hidden self-center text-xs font-bold uppercase md:inline">Jetzt</span>}
    </div>
  );
}

interface BlockPanelProps {
  block: ProgramBlock;
  entries: EventScheduleEntry[];
  activeEntryId: string | null | undefined;
}

function BlockPanel({ block, entries, activeEntryId }: BlockPanelProps) {
  return (
    <div>
      {entries.map((entry) => (
        <EntryRow key={entry.id ?? `${block}-${entry.time}-${entry.title}`} entry={entry} active={activeEntryId === entry.id} />
      ))}
    </div>
  );
}

interface DayScheduleBlocksProps {
  day: EventSchedule;
  isLive: boolean;
  currentEntryId: string | null | undefined;
}

export function DayScheduleBlocks({ day, isLive, currentEntryId }: DayScheduleBlocksProps) {
  const groups = useMemo(() => groupEntriesByBlock(day.entries), [day.entries]);
  const blocks = (['run_1', 'run_2', 'other'] as ProgramBlock[]).filter((block) => groups[block].length > 0);
  const activeBlock = useMemo(
    () => (isLive ? resolveActiveBlock(day.entries, currentEntryId, new Date()) : blocks[0]),
    [day.entries, currentEntryId, isLive, blocks]
  );
  const [openBlocks, setOpenBlocks] = useState<string[]>(activeBlock ? [activeBlock] : []);
  const [showAll, setShowAll] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpenBlocks(activeBlock ? [activeBlock] : []);
  }, [activeBlock]);

  useEffect(() => {
    if (isLive && currentEntryId) {
      rowRef.current?.querySelector('#schedule-current-entry')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntryId]);

  if (blocks.length <= 1) {
    return (
      <div ref={rowRef}>
        {blocks.map((block) => (
          <BlockPanel key={block} block={block} entries={groups[block]} activeEntryId={currentEntryId} />
        ))}
        {day.after_program_note && (
          <div className="-mx-5 flex items-center gap-3 bg-[#111827] px-5 py-5 text-white md:-mx-8 md:px-8">
            <Music2 className="h-5 w-5 text-accent" />
            <strong>{day.after_program_note}</strong>
          </div>
        )}
      </div>
    );
  }

  const effectiveOpen = showAll ? blocks : openBlocks;

  return (
    <div ref={rowRef}>
      <div className="mb-3 flex justify-end md:hidden">
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowAll((prev) => !prev)}>
          {showAll ? 'Weniger anzeigen' : 'Alle Zeiten'}
        </Button>
      </div>
      <div className="hidden gap-6 md:grid md:grid-cols-2">
        {blocks.map((block) => (
          <div key={block} className="rounded-md border border-border">
            <div className="border-b border-border bg-muted/40 px-4 py-3">
              <p className="font-semibold">{BLOCK_LABEL[block]}</p>
              <p className="text-xs text-muted-foreground">
                {formatTimeRange(blockTimeRange(groups[block]))} · {groups[block].length} Programmpunkte
              </p>
            </div>
            <div className="px-4">
              <BlockPanel block={block} entries={groups[block]} activeEntryId={currentEntryId} />
            </div>
          </div>
        ))}
      </div>
      <Accordion type="multiple" value={effectiveOpen} onValueChange={setOpenBlocks} className="md:hidden">
        {blocks.map((block) => (
          <AccordionItem key={block} value={block} className="border-b-0 border-t border-border first:border-t-0">
            <AccordionTrigger className="px-1">
              <span className="text-left">
                <span className="block font-semibold">{BLOCK_LABEL[block]}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {formatTimeRange(blockTimeRange(groups[block]))} · {groups[block].length} Programmpunkte
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <BlockPanel block={block} entries={groups[block]} activeEntryId={currentEntryId} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {day.after_program_note && (
        <div className="-mx-5 mt-4 flex items-center gap-3 bg-[#111827] px-5 py-5 text-white md:-mx-8 md:px-8">
          <Music2 className="h-5 w-5 text-accent" />
          <strong>{day.after_program_note}</strong>
        </div>
      )}
    </div>
  );
}

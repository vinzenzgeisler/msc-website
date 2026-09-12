import { useEffect, useState } from 'react';
import { Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCastVote, useDeviceVoteStatus, useEventHubClass, useEventHubVoting } from '@/hooks/useEventHubVoting';
import { computeVotingProgress, sortClassesWithPriority } from '@/lib/eventHubVoting';
import { ClassVoteCard } from './ClassVoteCard';

interface VotingSectionProps {
  /** Classes to surface first (e.g. the class currently running), from the schedule. */
  priorityClassIds?: string[];
}

export function VotingSection({ priorityClassIds = [] }: VotingSectionProps) {
  const { t } = useLanguage();
  const { data, isLoading, votingEnabled, votingPreview } = useEventHubVoting();
  const eventId = data?.event.id;
  const deviceStatus = useDeviceVoteStatus(votingEnabled ? eventId : undefined);
  const castVote = useCastVote(eventId);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [activeClassId, setActiveClassId] = useState('');

  useEffect(() => {
    if (activeClassId) return;
    const preferred = priorityClassIds.find((id) => data?.classes.some((item) => item.id === id));
    if (preferred) setActiveClassId(preferred);
    else if (data?.classes[0]) setActiveClassId(data.classes[0].id);
  }, [activeClassId, data?.classes, priorityClassIds]);

  const classes = sortClassesWithPriority(data?.classes ?? [], priorityClassIds);
  const activeClass = classes.find((item) => item.id === activeClassId) ?? classes[0];
  const classQuery = useEventHubClass(votingEnabled ? activeClass?.id : undefined);

  if (!votingEnabled || !data) {
    return null;
  }

  const votedClassIds = deviceStatus.data?.votedClassIds ?? [];
  const progress = computeVotingProgress(data.classes, votedClassIds);

  const handleVote = async (classId: string, entryId: string) => {
    setVoteError(null);
    try {
      await castVote.mutateAsync({ classId, entryId });
    } catch {
      setVoteError(t.voting.votingError);
    }
  };

  return (
    <section id="publikumsvoting" className="scroll-mt-24">
      {votingPreview && (
        <p className="mb-4 border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm font-medium">
          Lokale Voting-Vorschau – Teststimmen werden nicht an den Server gesendet.
        </p>
      )}

      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <Vote className="h-6 w-6 text-primary" aria-hidden />
          {t.voting.sectionTitle}
        </h2>
        {data.votingStatus === 'open' && (
          <span className="text-sm text-muted-foreground shrink-0">
            {progress.votedCount} {t.voting.progress} {progress.totalCount} {t.voting.progressClasses}
          </span>
        )}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">{t.common.loading}</p>}
      {voteError && <p className="mb-3 text-sm text-destructive">{voteError}</p>}

      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {classes.map((eventClass) => <Button key={eventClass.id} type="button" size="sm" variant={eventClass.id === activeClass?.id ? 'default' : 'outline'} className="shrink-0" onClick={() => setActiveClassId(eventClass.id)}>{eventClass.name}{votedClassIds.includes(eventClass.id) ? ' ✓' : ''}</Button>)}
      </div>
      <div>
        {classQuery.isLoading && <div className="h-64 animate-pulse rounded-xl bg-muted" aria-label={t.common.loading} />}
        {classQuery.isError && <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{t.voting.votingError}</p>}
        {activeClass && !classQuery.isLoading && !classQuery.isError && (
          <ClassVoteCard
            key={activeClass.id}
            eventClass={activeClass}
            candidates={classQuery.data?.candidates ?? []}
            votingStatus={data.votingStatus}
            votedClassIds={votedClassIds}
            result={classQuery.data?.result ?? undefined}
            submitting={castVote.isPending}
            onVote={handleVote}
          />
        )}
      </div>
    </section>
  );
}

export function VotingStickyButton() {
  const { t } = useLanguage();
  const { data, votingEnabled } = useEventHubVoting();

  if (!votingEnabled || !data || data.votingStatus !== 'open') return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 sm:hidden">
      <Button asChild size="lg" className="shadow-lg">
        <a href="#publikumsvoting">
          <Vote className="mr-2 h-4 w-4" aria-hidden />
          {t.voting.stickyButton}
        </a>
      </Button>
    </div>
  );
}

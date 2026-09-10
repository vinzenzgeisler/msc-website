import { useState } from 'react';
import { Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCastVote, useDeviceVoteStatus, useEventHubVoting } from '@/hooks/useEventHubVoting';
import { computeVotingProgress, groupCandidatesByClass, sortClassesWithPriority } from '@/lib/eventHubVoting';
import { ClassVoteCard } from './ClassVoteCard';
import { VoteHintSheet } from './VoteHintSheet';

interface VotingSectionProps {
  /** Classes to surface first (e.g. the class currently running), from the schedule. */
  priorityClassIds?: string[];
}

export function VotingSection({ priorityClassIds = [] }: VotingSectionProps) {
  const { t } = useLanguage();
  const { data, isLoading, votingEnabled } = useEventHubVoting();
  const eventId = data?.event.id;
  const deviceStatus = useDeviceVoteStatus(votingEnabled ? eventId : undefined);
  const castVote = useCastVote(eventId);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  if (!votingEnabled || !data) {
    return null;
  }

  const votedClassIds = deviceStatus.data?.votedClassIds ?? [];
  const classes = sortClassesWithPriority(data.classes, priorityClassIds);
  const candidatesByClass = groupCandidatesByClass(data.candidates);
  const resultsByClass = new Map((data.results ?? []).map((r) => [r.classId, r]));
  const progress = computeVotingProgress(data.classes, votedClassIds);

  const handleVote = async (classId: string, entryId: string) => {
    setHasInteracted(true);
    setVoteError(null);
    try {
      await castVote.mutateAsync({ classId, entryId });
    } catch {
      setVoteError(t.voting.votingError);
    }
  };

  return (
    <section id="publikumsvoting" className="scroll-mt-24">
      <VoteHintSheet eventId={data.event.id} hasInteracted={hasInteracted} />

      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((eventClass) => (
          <ClassVoteCard
            key={eventClass.id}
            eventClass={eventClass}
            candidates={candidatesByClass.get(eventClass.id) ?? []}
            votingStatus={data.votingStatus}
            votedClassIds={votedClassIds}
            result={resultsByClass.get(eventClass.id)}
            submitting={castVote.isPending}
            onVote={handleVote}
          />
        ))}
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

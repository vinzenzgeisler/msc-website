import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/i18n/LanguageContext';
import { isClassVotable, type EventHubCandidate, type EventHubClass, type EventHubClassResult, type VotingStatus } from '@/lib/eventHubVoting';
import { VoteConfirmDialog } from './VoteConfirmDialog';

interface ClassVoteCardProps {
  eventClass: EventHubClass;
  candidates: EventHubCandidate[];
  votingStatus: VotingStatus;
  votedClassIds: string[];
  result: EventHubClassResult | undefined;
  submitting: boolean;
  onVote: (classId: string, entryId: string) => Promise<void>;
}

export function ClassVoteCard({ eventClass, candidates, votingStatus, votedClassIds, result, submitting, onVote }: ClassVoteCardProps) {
  const { t } = useLanguage();
  const [pendingCandidate, setPendingCandidate] = useState<EventHubCandidate | null>(null);
  const votable = isClassVotable(votingStatus, eventClass.id, votedClassIds);
  const hasVoted = votedClassIds.includes(eventClass.id);

  const handleConfirm = async () => {
    if (!pendingCandidate) return;
    await onVote(eventClass.id, pendingCandidate.entryId);
    setPendingCandidate(null);
  };

  if (votingStatus === 'closed' && result) {
    const sorted = [...result.entries].sort((a, b) => b.voteCount - a.voteCount);
    return (
      <div className="rounded-lg border bg-card p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between sm:mb-3">
          <h3 className="font-semibold">{eventClass.name}</h3>
          <Badge variant="secondary">{t.voting.resultsTitle}</Badge>
        </div>
        <ul className="space-y-2">
          {sorted.map((entry, index) => (
            <li key={entry.entryId} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 min-w-0">
                {index === 0 && <span aria-hidden>🏆</span>}
                <span className="truncate">{entry.driverName}</span>
              </span>
              <span className="text-muted-foreground shrink-0">
                {entry.voteCount} · {entry.percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
        <h3 className="font-semibold">{eventClass.name}</h3>
        {hasVoted && <Badge variant="secondary">{t.voting.votedBadge}</Badge>}
      </div>
      {votingStatus === 'not_open' && <p className="text-sm text-muted-foreground">{t.voting.votingNotOpen}</p>}
      {votingStatus === 'open' && candidates.length === 0 && (
        <p className="text-sm text-muted-foreground">{t.voting.loadError}</p>
      )}
      {votingStatus === 'open' && candidates.length > 0 && (
        <div role="radiogroup" aria-label={eventClass.name} className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-2">
          {candidates.map((candidate) => (
            <button
              key={candidate.entryId}
              type="button"
              role="radio"
              aria-checked={false}
              disabled={!votable || submitting}
              onClick={() => votable && setPendingCandidate(candidate)}
              className="flex min-h-[44px] items-center gap-2.5 rounded-md border p-2.5 text-left text-sm transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3 sm:p-3"
            >
              {candidate.vehicleImageUrl ? (
                <img src={candidate.vehicleImageUrl} alt="" loading="lazy" decoding="async" className="h-12 w-12 rounded object-cover shrink-0" />
              ) : (
                <span className="h-10 w-10 rounded bg-muted shrink-0" aria-hidden />
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {candidate.startNumberNorm ? `#${candidate.startNumberNorm} · ` : ''}
                  {candidate.driverName}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[candidate.vehicleMake, candidate.vehicleModel].filter(Boolean).join(' ')}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
      {hasVoted && votingStatus === 'open' && <p className="mt-2 text-xs text-muted-foreground">{t.voting.alreadyVoted}</p>}

      <VoteConfirmDialog
        candidate={pendingCandidate}
        submitting={submitting}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setPendingCandidate(null)}
      />
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import { useEventHubClasses } from '@/hooks/useEventHubVoting';
import { useLanguage } from '@/i18n/LanguageContext';
import { collectVotingWinners, type EventHubClass } from '@/lib/eventHubVoting';

interface VotingResultsListProps {
  classes: EventHubClass[];
}

export function VotingResultsList({ classes }: VotingResultsListProps) {
  const { t } = useLanguage();
  const classQueries = useEventHubClasses(classes.map((eventClass) => eventClass.id));
  const isLoading = classQueries.some((query) => query.isLoading);
  const isError = classQueries.some((query) => query.isError);
  const winners = collectVotingWinners(classes, classQueries.map((query) => query.data?.result));

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" aria-label={t.common.loading} />;
  }

  if (isError) {
    return <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{t.voting.loadError}</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">{t.voting.winnersTitle}</h3>
        <Badge variant="secondary">{t.voting.resultsTitle}</Badge>
      </div>
      {winners.length > 0 ? (
        <ul className="divide-y">
          {winners.map((winner) => (
            <li key={`${winner.classId}-${winner.entryId}`} className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg" aria-hidden>🏆</span>
              <span className="min-w-0 flex-1 font-medium">{winner.driverName}</span>
              <span className="shrink-0 text-right text-sm text-muted-foreground">{winner.className}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-5 text-sm text-muted-foreground">{t.voting.votingClosed}</p>
      )}
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import { useEventHubClasses } from '@/hooks/useEventHubVoting';
import { useLanguage } from '@/i18n/LanguageContext';
import { collectVotingWinners, type EventHubClass } from '@/lib/eventHubVoting';

interface VotingResultsListProps {
  classes: EventHubClass[];
  emptyText?: string;
}

export function VotingResultsList({ classes, emptyText }: VotingResultsListProps) {
  const { t } = useLanguage();
  const classQueries = useEventHubClasses(classes.map((eventClass) => eventClass.id));
  const isLoading = classQueries.some((query) => query.isLoading);
  const isError = classQueries.some((query) => query.isError);
  const winners = collectVotingWinners(classes, classQueries.map((query) => query.data?.result));
  const candidatesByEntryId = new Map(
    classQueries.flatMap((query) => query.data?.candidates ?? []).map((candidate) => [candidate.entryId, candidate])
  );

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
        <ul className="grid gap-px bg-border sm:grid-cols-2">
          {winners.map((winner) => {
            const candidate = candidatesByEntryId.get(winner.entryId);
            const vehicle = [candidate?.vehicleMake, candidate?.vehicleModel, candidate?.vehicleYear].filter(Boolean).join(' · ');

            return (
              <li key={`${winner.classId}-${winner.entryId}`} className="group relative min-h-56 overflow-hidden bg-slate-950 text-white">
                {candidate?.vehicleImageUrl ? (
                  <img
                    src={candidate.vehicleImageUrl}
                    alt={vehicle ? `${winner.driverName}, ${vehicle}` : winner.driverName}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-slate-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/5" />
                <div className="relative flex min-h-56 flex-col justify-end p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70">{winner.className}</p>
                  <h4 className="mt-1 text-xl font-black">{winner.driverName}</h4>
                  {vehicle && <p className="mt-1 text-sm text-white/75">{vehicle}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 py-5 text-sm text-muted-foreground">{emptyText || t.voting.votingClosed}</p>
      )}
    </div>
  );
}

import { Sparkles, MapPin, Baby, UserRound, Clock3, Gauge, Zap, Cog } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useEventHubVoting } from '@/hooks/useEventHubVoting';
import type { EventHubCandidate, EventHubFactEntry, EventHubFacts } from '@/lib/eventHubVoting';

type FactKey = keyof EventHubFacts;

const FACT_UNITS: Partial<Record<FactKey, string>> = {
  farthestTravelKm: 'km',
  youngestDriver: 'J.',
  oldestDriver: 'J.',
  oldestVehicle: '',
  largestDisplacementCcm: 'ccm',
  highestPowerPs: 'PS',
  mostCylinders: ''
};

const FACT_ICONS: Record<FactKey, typeof MapPin> = {
  farthestTravelKm: MapPin,
  youngestDriver: Baby,
  oldestDriver: UserRound,
  oldestVehicle: Clock3,
  largestDisplacementCcm: Gauge,
  highestPowerPs: Zap,
  mostCylinders: Cog
};

/**
 * Multiple entries can be tied for a fact (e.g. same age), including a driver who
 * registered more than one vehicle — dedupe by driver name so they aren't listed twice.
 */
function dedupeEntries(entries: EventHubFactEntry[]): EventHubFactEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = entry.driverName.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function FactCard({
  entries,
  label,
  unit,
  Icon,
  candidatesById
}: {
  entries: EventHubFactEntry[];
  label: string;
  unit: string;
  Icon: typeof MapPin;
  candidatesById: Map<string, EventHubCandidate>;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <ul className="space-y-2">
        {entries.map((entry) => {
          const image = candidatesById.get(entry.entryId)?.vehicleImageUrl;
          return (
            <li key={entry.entryId} className="flex items-center gap-3">
              {image ? (
                <img src={image} alt="" className="h-9 w-9 rounded-full object-cover shrink-0 ring-1 ring-border" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0" aria-hidden>
                  <UserRound className="h-4 w-4" />
                </span>
              )}
              <span className="min-w-0 text-sm">
                <span className="block truncate font-semibold">{entry.driverName}</span>
                <span className="block text-muted-foreground">
                  {entry.value}
                  {unit ? ` ${unit}` : ''}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function HighlightsSection() {
  const { t } = useLanguage();
  const { data, votingEnabled } = useEventHubVoting();

  if (!votingEnabled || !data || data.votingStatus === 'closed') {
    return null;
  }

  const factLabels: Record<FactKey, string> = {
    farthestTravelKm: t.voting.factFarthestTravel,
    youngestDriver: t.voting.factYoungestDriver,
    oldestDriver: t.voting.factOldestDriver,
    oldestVehicle: t.voting.factOldestVehicle,
    largestDisplacementCcm: t.voting.factLargestDisplacement,
    highestPowerPs: t.voting.factHighestPower,
    mostCylinders: t.voting.factMostCylinders
  };

  const candidatesById = new Map(data.candidates.map((candidate) => [candidate.entryId, candidate]));

  const visibleFacts = (Object.keys(factLabels) as FactKey[])
    .map((key) => ({ key, entries: dedupeEntries(data.facts[key] ?? []) }))
    .filter((item): item is { key: FactKey; entries: EventHubFactEntry[] } => item.entries.length > 0);

  if (visibleFacts.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold">
        <Sparkles className="h-6 w-6 text-primary" aria-hidden />
        {t.voting.factsTitle}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleFacts.map(({ key, entries }) => (
          <FactCard
            key={key}
            entries={entries}
            label={factLabels[key]}
            unit={FACT_UNITS[key] ?? ''}
            Icon={FACT_ICONS[key]}
            candidatesById={candidatesById}
          />
        ))}
      </div>
    </section>
  );
}

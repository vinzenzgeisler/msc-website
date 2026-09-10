import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useEventHubVoting } from '@/hooks/useEventHubVoting';
import type { EventHubFactEntry, EventHubFacts } from '@/lib/eventHubVoting';

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

function FactRow({ entries, label, unit }: { entries: EventHubFactEntry[]; label: string; unit: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">
        {entries.map((entry, index) => (
          <span key={entry.entryId}>
            {index > 0 ? ' · ' : ''}
            <span className="font-semibold">{entry.driverName}</span>{' '}
            <span className="text-muted-foreground">
              ({entry.value}
              {unit ? ` ${unit}` : ''})
            </span>
          </span>
        ))}
      </p>
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

  const visibleFacts = (Object.keys(factLabels) as FactKey[])
    .map((key) => ({ key, entries: data.facts[key] }))
    .filter((item): item is { key: FactKey; entries: EventHubFactEntry[] } => Boolean(item.entries && item.entries.length > 0));

  if (visibleFacts.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold">
        <Sparkles className="h-6 w-6 text-primary" aria-hidden />
        {t.voting.factsTitle}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleFacts.map(({ key, entries }) => (
          <FactRow key={key} entries={entries} label={factLabels[key]} unit={FACT_UNITS[key] ?? ''} />
        ))}
      </div>
    </section>
  );
}

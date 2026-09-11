import { useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { EventSubnav } from '@/components/event/EventSubnav';
import { HighlightsSection } from '@/components/event/highlights/HighlightsSection';
import { VotingSection } from '@/components/event/voting/VotingSection';
import { useMainEvent } from '@/hooks/useMainEvent';
import { useEventContent } from '@/hooks/useEventContent';
import { resolveEventPhase, resolveLiveScheduleState } from '@/lib/event-hub';
import { useLanguage } from '@/i18n/LanguageContext';

const copy = {
  de: { title: 'Fahrer & Publikumsvoting', description: 'Fahrer und Fahrzeuge entdecken und klassenweise abstimmen.' },
  en: { title: 'Drivers & audience vote', description: 'Discover drivers and vehicles and vote in each class.' },
  cz: { title: 'Jezdci a divácké hlasování', description: 'Objevte jezdce a vozidla a hlasujte v jednotlivých třídách.' },
  pl: { title: 'Kierowcy i głosowanie publiczności', description: 'Poznaj kierowców i pojazdy oraz głosuj w każdej klasie.' }
} as const;

export default function DriversVotingPage() {
  const { locale } = useLanguage();
  const { data: event } = useMainEvent();
  const { data: content } = useEventContent(event?.id);
  const now = new Date();
  const phase = event ? resolveEventPhase(now, event) : 'pre';
  const live = useMemo(() => resolveLiveScheduleState(now, content?.schedules ?? []), [content?.schedules]);
  const activeClassIds = phase === 'live' ? live.current?.backend_class_ids ?? [] : [];
  return <MainLayout title={copy[locale].title} description={copy[locale].description} canonicalPath="/event/fahrer"><EventSubnav/><div className="container max-w-5xl space-y-10 py-8 md:space-y-14 md:py-12"><HighlightsSection classIds={activeClassIds}/><VotingSection priorityClassIds={activeClassIds}/></div></MainLayout>;
}

import { MainLayout } from '@/components/layout/MainLayout';
import { EventSubnav } from '@/components/event/EventSubnav';
import { HighlightsSection } from '@/components/event/highlights/HighlightsSection';
import { VotingSection } from '@/components/event/voting/VotingSection';
import { useMainEvent } from '@/hooks/useMainEvent';
import { useEventContent } from '@/hooks/useEventContent';
import { resolveEventPhase, resolveLiveScheduleState } from '@/lib/event-hub';
import { useLanguage } from '@/i18n/LanguageContext';

const copy = {
  de: { title: 'Fahrer & Publikumsvoting', description: 'Fahrer und Fahrzeuge entdecken und klassenweise abstimmen.', resultsTitle: 'Fahrer & Ergebnisse', resultsDescription: 'Fahrer und Fahrzeuge des Oberlausitzer Dreiecks sowie die Ergebnisse des Publikumsvotings.' },
  en: { title: 'Drivers & audience vote', description: 'Discover drivers and vehicles and vote in each class.', resultsTitle: 'Drivers & results', resultsDescription: 'Drivers and vehicles of the Oberlausitzer Dreieck and the audience vote results.' },
  cz: { title: 'Jezdci a divácké hlasování', description: 'Objevte jezdce a vozidla a hlasujte v jednotlivých třídách.', resultsTitle: 'Jezdci a výsledky', resultsDescription: 'Jezdci a vozidla závodu Oberlausitzer Dreieck a výsledky diváckého hlasování.' },
  pl: { title: 'Kierowcy i głosowanie publiczności', description: 'Poznaj kierowców i pojazdy oraz głosuj w każdej klasie.', resultsTitle: 'Kierowcy i wyniki', resultsDescription: 'Kierowcy i pojazdy Oberlausitzer Dreieck oraz wyniki głosowania publiczności.' }
} as const;

const jumpCopy = {
  de: 'Direkt zum Voting',
  en: 'Jump to voting',
  cz: 'Přejít přímo na hlasování',
  pl: 'Przejdź do głosowania'
} as const;

const resultJumpCopy = {
  de: 'Direkt zu den Ergebnissen',
  en: 'Jump to the results',
  cz: 'Přejít přímo k výsledkům',
  pl: 'Przejdź do wyników'
} as const;

export default function DriversVotingPage() {
  const { locale } = useLanguage();
  const { data: event } = useMainEvent();
  const { data: content } = useEventContent(event?.id);
  const now = new Date();
  const phase = event ? resolveEventPhase(now, event) : 'pre';
  const live = resolveLiveScheduleState(now, content?.schedules ?? []);
  const activeClassIds = phase === 'live' ? live.current?.backend_class_ids ?? [] : [];
  const postEvent = phase === 'post';
  const pageCopy = copy[locale];
  return <MainLayout title={postEvent ? pageCopy.resultsTitle : pageCopy.title} description={postEvent ? pageCopy.resultsDescription : pageCopy.description} canonicalPath="/event/fahrer"><EventSubnav phase={phase}/><div className="container max-w-5xl space-y-6 py-8 md:space-y-10 md:py-12"><div className="flex justify-end"><a href="#publikumsvoting" className="text-sm font-semibold text-primary hover:underline">{postEvent ? resultJumpCopy[locale] : jumpCopy[locale]} →</a></div><HighlightsSection classIds={activeClassIds} compact/><VotingSection priorityClassIds={activeClassIds} mode={postEvent ? 'results' : 'interactive'}/></div></MainLayout>;
}

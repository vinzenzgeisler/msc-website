import { NavLink } from 'react-router-dom';
import { CalendarDays, Gavel, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import type { EventPhase } from '@/lib/event-hub';

const labels = {
  de: { nav: 'Eventbereiche', event: 'Event', review: 'Rückblick', drivers: 'Fahrer & Voting', results: 'Fahrer & Ergebnisse', auction: 'Didier-Grams-Auktion' },
  en: { nav: 'Event sections', event: 'Event', review: 'Review', drivers: 'Drivers & voting', results: 'Drivers & results', auction: 'Didier Grams auction' },
  cz: { nav: 'Sekce akce', event: 'Akce', review: 'Ohlédnutí', drivers: 'Jezdci a hlasování', results: 'Jezdci a výsledky', auction: 'Aukce Didiera Gramse' },
  pl: { nav: 'Sekcje wydarzenia', event: 'Wydarzenie', review: 'Podsumowanie', drivers: 'Kierowcy i głosowanie', results: 'Kierowcy i wyniki', auction: 'Aukcja Didiera Gramsa' }
} as const;

export function EventSubnav({ phase }: { phase?: EventPhase }) {
  const { locale } = useLanguage();
  const copy = labels[locale];
  const links = phase === 'post'
    ? [
        { to: '/event', label: copy.review, icon: CalendarDays, end: true },
        { to: '/event/fahrer', label: copy.results, icon: UsersRound, end: false },
      ]
    : [
        { to: '/event', label: copy.event, icon: CalendarDays, end: true },
        { to: '/event/fahrer', label: copy.drivers, icon: UsersRound, end: false },
        { to: '/event/helm-versteigerung', label: copy.auction, icon: Gavel, end: false },
      ];
  return <nav aria-label={copy.nav} className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur">
    <div className="container flex max-w-5xl overflow-x-auto py-2">
      {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors sm:px-5', isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}><Icon className="h-4 w-4"/>{label}</NavLink>)}
    </div>
  </nav>;
}

import { NavLink } from 'react-router-dom';
import { CalendarDays, Gavel, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/event', label: 'Event', icon: CalendarDays, end: true },
  { to: '/event/fahrer', label: 'Fahrer & Voting', icon: UsersRound, end: false },
  { to: '/event/helm-versteigerung', label: 'Helm-Auktion', icon: Gavel, end: false }
];

export function EventSubnav() {
  return <nav aria-label="Eventbereiche" className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur">
    <div className="container flex max-w-5xl overflow-x-auto py-2">
      {links.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-colors sm:px-5', isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}><Icon className="h-4 w-4"/>{label}</NavLink>)}
    </div>
  </nav>;
}

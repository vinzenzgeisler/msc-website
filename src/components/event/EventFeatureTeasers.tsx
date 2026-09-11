import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { Gavel, Vote, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchPublicAuction, fetchPublicEventHubSummary } from '@/integrations/event-backend/client';

const euro = (cents: number | null | undefined) => cents == null ? 'Noch kein Gebot' : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);

export function EventFeatureTeasers() {
  const summary = useQuery({ queryKey: ['event-hub-summary'], queryFn: fetchPublicEventHubSummary, retry: false });
  const data = summary.data;
  const auction = useQuery({ queryKey: ['public-auction'], queryFn: fetchPublicAuction, retry: false });
  return <section className="border-b bg-muted/30 py-5 md:py-7"><div className="container grid max-w-5xl gap-3 sm:grid-cols-2">
    <Link to="/event/fahrer" className="group flex min-h-24 items-center gap-4 rounded-lg border bg-card p-4 transition hover:border-primary"><span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary"><Vote/></span><span><strong className="block">Fahrer & Publikumsvoting</strong><span className="text-sm text-muted-foreground">{data?.votingStatus === 'open' ? 'Jetzt Favoriten wählen' : 'Fahrer und Fahrzeuge entdecken'}</span></span><span className="ml-auto text-xl group-hover:translate-x-1">→</span></Link>
    <Link to="/event/helm-versteigerung" className="group flex min-h-24 items-center gap-4 rounded-lg border bg-card p-4 transition hover:border-primary"><span className="grid h-11 w-11 place-items-center rounded-full bg-amber-500/15 text-amber-700"><Gavel/></span><span><strong className="block">Helm von Didier Grams</strong><span className="text-sm text-muted-foreground">{auction.data?.status === 'open' ? `Höchstgebot ${euro(auction.data.currentHighestCents)}` : 'Versteigerung ansehen'}</span></span><span className="ml-auto text-xl group-hover:translate-x-1">→</span></Link>
  </div></section>;
}

export function EventFeatureNudge() {
  const location = useLocation();
  const summary = useQuery({ queryKey: ['event-hub-summary'], queryFn: fetchPublicEventHubSummary, retry: false });
  const data = summary.data;
  const auction = useQuery({ queryKey: ['public-auction'], queryFn: fetchPublicAuction, retry: false });
  const [open, setOpen] = useState(false);
  const eventId = data?.event.id ?? auction.data?.eventId;
  useEffect(() => {
    if (location.pathname !== '/event' || !eventId || localStorage.getItem(`event-feature-nudge-v1-${eventId}`)) return;
    const timer = window.setTimeout(() => setOpen(true), 20_000);
    return () => clearTimeout(timer);
  }, [eventId, location.pathname]);
  if (!open || !eventId) return null;
  const votingFirst = data?.votingStatus === 'open';
  const dismiss = () => { localStorage.setItem(`event-feature-nudge-v1-${eventId}`, '1'); setOpen(false); };
  return <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-md rounded-xl border bg-background p-4 shadow-2xl"><button onClick={dismiss} aria-label="Schließen" className="absolute right-3 top-3 p-2"><X className="h-4 w-4"/></button><p className="pr-8 text-lg font-bold">{votingFirst ? 'Dein Favorit zählt' : 'Ein besonderer Helm sucht einen neuen Besitzer'}</p><p className="mt-1 text-sm text-muted-foreground">{votingFirst ? 'Stimme klassenweise für Fahrer und Fahrzeuge ab.' : 'Biete auf den Helm von Didier Grams.'}</p><div className="mt-4 flex gap-2"><Button asChild onClick={dismiss}><Link to={votingFirst ? '/event/fahrer' : '/event/helm-versteigerung'}>{votingFirst ? 'Jetzt voten' : 'Zur Versteigerung'}</Link></Button><Button variant="ghost" asChild onClick={dismiss}><Link to={votingFirst ? '/event/helm-versteigerung' : '/event/fahrer'}>{votingFirst ? 'Helm-Auktion' : 'Fahrer ansehen'}</Link></Button></div></div>;
}

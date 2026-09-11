import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { Gavel, Vote, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchPublicAuction, fetchPublicEventHubSummary } from '@/integrations/event-backend/client';
import { useLanguage } from '@/i18n/LanguageContext';

const copy = {
  de: { drivers: 'Fahrer & Publikumsvoting', vote: 'Jetzt Favoriten wählen', discover: 'Fahrer und Fahrzeuge entdecken', helmet: 'Helm von Didier Grams', highest: 'Höchstgebot', viewAuction: 'Versteigerung ansehen', noBid: 'Noch kein Gebot', close: 'Schließen', voteTitle: 'Dein Favorit zählt', auctionTitle: 'Ein besonderer Helm sucht einen neuen Besitzer', voteText: 'Stimme klassenweise für Fahrer und Fahrzeuge ab.', auctionText: 'Biete auf den Helm von Didier Grams.', voteCta: 'Jetzt voten', auctionCta: 'Zur Versteigerung', auctionShort: 'Helm-Auktion', driversShort: 'Fahrer ansehen' },
  en: { drivers: 'Drivers & audience vote', vote: 'Choose your favourites now', discover: 'Discover drivers and vehicles', helmet: "Didier Grams' helmet", highest: 'Highest bid', viewAuction: 'View auction', noBid: 'No bids yet', close: 'Close', voteTitle: 'Your favourite counts', auctionTitle: 'A special helmet is looking for a new owner', voteText: 'Vote for drivers and vehicles in each class.', auctionText: "Bid on Didier Grams' helmet.", voteCta: 'Vote now', auctionCta: 'Go to auction', auctionShort: 'Helmet auction', driversShort: 'View drivers' },
  cz: { drivers: 'Jezdci a divácké hlasování', vote: 'Vyberte favority', discover: 'Objevte jezdce a vozidla', helmet: 'Helma Didiera Gramse', highest: 'Nejvyšší nabídka', viewAuction: 'Zobrazit aukci', noBid: 'Zatím bez nabídky', close: 'Zavřít', voteTitle: 'Na vašem favoritovi záleží', auctionTitle: 'Výjimečná helma hledá nového majitele', voteText: 'Hlasujte pro jezdce a vozidla v jednotlivých třídách.', auctionText: 'Přihazujte na helmu Didiera Gramse.', voteCta: 'Hlasovat', auctionCta: 'Přejít do aukce', auctionShort: 'Aukce helmy', driversShort: 'Zobrazit jezdce' },
  pl: { drivers: 'Kierowcy i głosowanie publiczności', vote: 'Wybierz swoich faworytów', discover: 'Poznaj kierowców i pojazdy', helmet: 'Kask Didiera Gramsa', highest: 'Najwyższa oferta', viewAuction: 'Zobacz aukcję', noBid: 'Brak ofert', close: 'Zamknij', voteTitle: 'Twój faworyt ma znaczenie', auctionTitle: 'Wyjątkowy kask szuka nowego właściciela', voteText: 'Głosuj na kierowców i pojazdy w każdej klasie.', auctionText: 'Złóż ofertę na kask Didiera Gramsa.', voteCta: 'Głosuj teraz', auctionCta: 'Przejdź do aukcji', auctionShort: 'Aukcja kasku', driversShort: 'Zobacz kierowców' }
} as const;
const localeTags = { de: 'de-DE', en: 'en-GB', cz: 'cs-CZ', pl: 'pl-PL' } as const;

export function EventFeatureTeasers() {
  const { locale } = useLanguage();
  const c = copy[locale];
  const euro = (cents: number | null | undefined) => cents == null ? c.noBid : new Intl.NumberFormat(localeTags[locale], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);
  const summary = useQuery({ queryKey: ['event_hub_voting'], queryFn: fetchPublicEventHubSummary, retry: false });
  const data = summary.data;
  const auction = useQuery({ queryKey: ['public-auction'], queryFn: fetchPublicAuction, retry: false });
  return <section className="border-b bg-muted/30 py-5 md:py-7"><div className="container grid max-w-5xl gap-3 sm:grid-cols-2">
    <Link to="/event/fahrer" className="group flex min-h-24 items-center gap-4 rounded-lg border bg-card p-4 transition hover:border-primary"><span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary"><Vote/></span><span><strong className="block">{c.drivers}</strong><span className="text-sm text-muted-foreground">{data?.votingStatus === 'open' ? c.vote : c.discover}</span></span><span className="ml-auto text-xl group-hover:translate-x-1">→</span></Link>
    <Link to="/event/helm-versteigerung" className="group flex min-h-24 items-center gap-4 rounded-lg border bg-card p-4 transition hover:border-primary"><span className="grid h-11 w-11 place-items-center rounded-full bg-amber-500/15 text-amber-700"><Gavel/></span><span><strong className="block">{c.helmet}</strong><span className="text-sm text-muted-foreground">{auction.data?.status === 'open' ? `${c.highest} ${euro(auction.data.currentHighestCents)}` : c.viewAuction}</span></span><span className="ml-auto text-xl group-hover:translate-x-1">→</span></Link>
  </div></section>;
}

export function EventFeatureNudge() {
  const { locale } = useLanguage();
  const c = copy[locale];
  const location = useLocation();
  const summary = useQuery({ queryKey: ['event_hub_voting'], queryFn: fetchPublicEventHubSummary, retry: false });
  const data = summary.data;
  const auction = useQuery({ queryKey: ['public-auction'], queryFn: fetchPublicAuction, retry: false });
  const [open, setOpen] = useState(false);
  const eventId = data?.event.id ?? auction.data?.eventId;
  const votingAvailable = data?.votingStatus === 'open';
  const auctionAvailable = auction.data?.status === 'open';
  useEffect(() => {
    if (location.pathname !== '/event' || !eventId || (!votingAvailable && !auctionAvailable) || localStorage.getItem(`event-feature-nudge-v1-${eventId}`)) return;
    const timer = window.setTimeout(() => setOpen(true), 20_000);
    return () => clearTimeout(timer);
  }, [auctionAvailable, eventId, location.pathname, votingAvailable]);
  if (!open || !eventId) return null;
  const votingFirst = votingAvailable;
  const dismiss = () => { localStorage.setItem(`event-feature-nudge-v1-${eventId}`, '1'); setOpen(false); };
  return <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-md rounded-xl border bg-background p-4 shadow-2xl"><button onClick={dismiss} aria-label={c.close} className="absolute right-3 top-3 p-2"><X className="h-4 w-4"/></button><p className="pr-8 text-lg font-bold">{votingFirst ? c.voteTitle : c.auctionTitle}</p><p className="mt-1 text-sm text-muted-foreground">{votingFirst ? c.voteText : c.auctionText}</p><div className="mt-4 flex gap-2"><Button asChild onClick={dismiss}><Link to={votingFirst ? '/event/fahrer' : '/event/helm-versteigerung'}>{votingFirst ? c.voteCta : c.auctionCta}</Link></Button><Button variant="ghost" asChild onClick={dismiss}><Link to={votingFirst ? '/event/helm-versteigerung' : '/event/fahrer'}>{votingFirst ? c.auctionShort : c.driversShort}</Link></Button></div></div>;
}

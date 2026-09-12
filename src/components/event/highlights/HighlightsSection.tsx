import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEventHubClasses, useEventHubVoting } from '@/hooks/useEventHubVoting';
import { useLanguage } from '@/i18n/LanguageContext';

const copy = {
  de: { section: 'Fahrer im Fokus', start: 'Startnummer', participant: 'Teilnehmer', expand: 'Bild vergrößern', previous: 'Vorheriger Fahrer', next: 'Nächster Fahrer' },
  en: { section: 'Featured drivers', start: 'Start number', participant: 'Participant', expand: 'Enlarge image', previous: 'Previous driver', next: 'Next driver' },
  cz: { section: 'Jezdci v centru pozornosti', start: 'Startovní číslo', participant: 'Účastník', expand: 'Zvětšit obrázek', previous: 'Předchozí jezdec', next: 'Další jezdec' },
  pl: { section: 'Kierowcy w centrum uwagi', start: 'Numer startowy', participant: 'Uczestnik', expand: 'Powiększ zdjęcie', previous: 'Poprzedni kierowca', next: 'Następny kierowca' }
} as const;

export function HighlightsSection({ classIds = [] }: { classIds?: string[] }) {
  const { locale } = useLanguage();
  const c = copy[locale];
  const { data, votingEnabled } = useEventHubVoting();
  const activeClasses = useEventHubClasses(votingEnabled ? classIds : []);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const candidates = useMemo(() => {
    const source = classIds.length ? activeClasses.flatMap((query) => query.data?.candidates ?? []) : (data?.highlights ?? []);
    const eligible = source.filter((item) => item.vehicleImageUrl);
    const featured = eligible.filter((item) => item.featured || item.pinned);
    return [...featured, ...eligible.filter((item) => !featured.includes(item))].slice(0, 10);
  }, [activeClasses, classIds, data?.highlights]);
  useEffect(() => setIndex(0), [classIds.join('|')]);
  useEffect(() => {
    if (candidates.length < 2 || expanded || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % candidates.length), 6000);
    return () => clearInterval(timer);
  }, [candidates.length, expanded]);
  if (!votingEnabled || !data || !candidates.length) return null;
  const candidate = candidates[index % candidates.length];
  const move = (step: number) => setIndex((value) => (value + step + candidates.length) % candidates.length);
  return <section aria-label={c.section}><div className="mb-2 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold sm:text-2xl"><Sparkles className="h-5 w-5 text-primary"/>{c.section}</h2><span className="text-xs text-muted-foreground">{index + 1}/{candidates.length}</span></div><article className="relative overflow-hidden rounded-xl bg-slate-950 text-white"><img src={candidate.vehicleImageUrl!} alt={`${candidate.driverName}, ${[candidate.vehicleMake, candidate.vehicleModel].filter(Boolean).join(' ')}`} className="aspect-[16/9] w-full object-cover sm:aspect-[16/7]" loading="eager" decoding="async"/><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-3 sm:p-6"><p className="text-xs font-bold uppercase tracking-wider text-white/70">{candidate.startNumberNorm ? `${c.start} ${candidate.startNumberNorm}` : c.participant}</p><h3 className="mt-0.5 text-lg font-black sm:mt-1 sm:text-3xl">{candidate.driverName}</h3><p className="text-xs text-white/75 sm:text-sm">{[candidate.vehicleMake, candidate.vehicleModel, candidate.vehicleYear].filter(Boolean).join(' · ')}</p></div><Button size="icon" variant="secondary" aria-label={c.expand} className="absolute right-3 top-3" onClick={() => setExpanded(true)}><Expand/></Button>{candidates.length > 1 && <><Button size="icon" variant="secondary" aria-label={c.previous} className="absolute left-3 top-1/2 -translate-y-1/2" onClick={() => move(-1)}><ChevronLeft/></Button><Button size="icon" variant="secondary" aria-label={c.next} className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => move(1)}><ChevronRight/></Button></>}</article><Dialog open={expanded} onOpenChange={setExpanded}><DialogContent className="max-w-5xl border-0 bg-black p-2"><img src={candidate.vehicleImageUrl!} alt={candidate.driverName} className="max-h-[88vh] w-full object-contain"/></DialogContent></Dialog></section>;
}

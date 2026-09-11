import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEventHubVoting } from '@/hooks/useEventHubVoting';

export function HighlightsSection({ classIds = [] }: { classIds?: string[] }) {
  const { data, votingEnabled } = useEventHubVoting();
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const candidates = useMemo(() => {
    const eligible = (data?.candidates ?? []).filter((item) => item.vehicleImageUrl && (!classIds.length || classIds.includes(item.classId)));
    const featured = eligible.filter((item) => item.featured || item.pinned);
    return [...featured, ...eligible.filter((item) => !featured.includes(item))].slice(0, 10);
  }, [classIds, data?.candidates]);
  useEffect(() => setIndex(0), [classIds.join('|')]);
  useEffect(() => {
    if (candidates.length < 2 || expanded || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % candidates.length), 6000);
    return () => clearInterval(timer);
  }, [candidates.length, expanded]);
  if (!votingEnabled || !data || !candidates.length) return null;
  const candidate = candidates[index % candidates.length];
  const move = (step: number) => setIndex((value) => (value + step + candidates.length) % candidates.length);
  return <section aria-label="Fahrer im Fokus"><div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl"><Sparkles className="h-5 w-5 text-primary"/>Fahrer im Fokus</h2><span className="text-xs text-muted-foreground">{index + 1}/{candidates.length}</span></div><article className="relative overflow-hidden rounded-xl bg-slate-950 text-white"><img src={candidate.vehicleImageUrl!} alt={`${candidate.driverName}, ${[candidate.vehicleMake, candidate.vehicleModel].filter(Boolean).join(' ')}`} className="aspect-[4/3] w-full object-cover sm:aspect-[16/8]" loading="eager" decoding="async"/><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-4 sm:p-6"><p className="text-xs font-bold uppercase tracking-wider text-white/70">{candidate.startNumberNorm ? `Startnummer ${candidate.startNumberNorm}` : 'Teilnehmer'}</p><h3 className="mt-1 text-2xl font-black sm:text-3xl">{candidate.driverName}</h3><p className="text-sm text-white/75">{[candidate.vehicleMake, candidate.vehicleModel, candidate.vehicleYear].filter(Boolean).join(' · ')}</p></div><Button size="icon" variant="secondary" aria-label="Bild vergrößern" className="absolute right-3 top-3" onClick={() => setExpanded(true)}><Expand/></Button>{candidates.length > 1 && <><Button size="icon" variant="secondary" aria-label="Vorheriger Fahrer" className="absolute left-3 top-1/2 -translate-y-1/2" onClick={() => move(-1)}><ChevronLeft/></Button><Button size="icon" variant="secondary" aria-label="Nächster Fahrer" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => move(1)}><ChevronRight/></Button></>}</article><Dialog open={expanded} onOpenChange={setExpanded}><DialogContent className="max-w-5xl border-0 bg-black p-2"><img src={candidate.vehicleImageUrl!} alt={candidate.driverName} className="max-h-[88vh] w-full object-contain"/></DialogContent></Dialog></section>;
}

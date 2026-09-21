import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { fetchEventIndex, toCdnUrl, type RacePicEventIndex } from '@/integrations/racepic/publicClient';

/** Fahrer-/Fahrzeugsuche innerhalb eines Events (Paket 8), siehe Architekturplan Abschnitt B/H. */
export default function RacePicEventPage() {
  const { eventSlug = '' } = useParams<{ eventSlug: string }>();
  const [data, setData] = useState<RacePicEventIndex | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchEventIndex(eventSlug)
      .then(setData)
      .catch(() => setError(true));
  }, [eventSlug]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data.participants;
    return data.participants.filter((participant) =>
      `${participant.startNumber} ${participant.displayName} ${participant.make ?? ''} ${participant.model ?? ''} ${participant.className}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [data, query]);

  return (
    <MainLayout
      title={data ? `RacePic – ${data.title}` : 'RacePic'}
      description="Finde deine Bilder per Fahrername, Startnummer oder Fahrzeug."
      canonicalPath={`/racepic/${eventSlug}`}
    >
      <section className="container max-w-4xl py-16">
        <p className="text-sm text-muted-foreground">
          <Link to="/racepic" className="hover:underline">
            RacePic
          </Link>
          {data && <> / {data.title}</>}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight">{data?.title ?? 'Lädt…'}</h1>

        {!data && !error && <Loader2 className="mt-8 h-8 w-8 animate-spin text-accent" />}
        {error && <p className="mt-6 text-muted-foreground">Diese Veranstaltung wurde nicht gefunden.</p>}

        {data && (
          <>
            <div className="relative mt-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Fahrer, Startnummer oder Fahrzeug suchen…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <p className="mt-4 text-sm text-muted-foreground">{filtered.length} Ergebnis(se)</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {filtered.map((participant) => (
                <Link
                  key={participant.participantKey}
                  to={`/racepic/${eventSlug}/${participant.participantKey}`}
                  className="group overflow-hidden rounded-xl border bg-card transition hover:border-accent"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={toCdnUrl(participant.coverThumbUrl)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-heading font-bold">
                      #{participant.startNumber} {participant.displayName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {participant.make} {participant.model} · {participant.imageCount} Bild(er)
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </MainLayout>
  );
}

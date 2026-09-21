import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { fetchPublishedEvents, type RacePicEventSummary } from '@/integrations/racepic/publicClient';

/** RacePic-Startseite (Paket 8): Liste veröffentlichter Events, siehe Architekturplan Abschnitt B/H. */
export default function RacePicHomePage() {
  const [events, setEvents] = useState<RacePicEventSummary[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPublishedEvents()
      .then(setEvents)
      .catch(() => setError(true));
  }, []);

  return (
    <MainLayout
      title="RacePic"
      description="Finde alle Bilder deines Fahrzeugs von unseren Motorsportveranstaltungen."
      canonicalPath="/racepic"
    >
      <section className="container max-w-3xl py-16 text-center">
        <Camera className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 font-heading text-4xl font-black uppercase tracking-tight">RacePic</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Finde alle Bilder deines Fahrzeugs – zentral, statt in einzelnen Fotografengalerien zu suchen.
        </p>

        <div className="mt-10 space-y-3">
          {!events && !error && <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />}
          {error && <p className="text-muted-foreground">RacePic ist aktuell nicht erreichbar.</p>}
          {events && events.length === 0 && <p className="text-muted-foreground">Noch keine Veranstaltung veröffentlicht.</p>}
          {events?.map((item) => (
            <Link
              key={item.eventId}
              to={`/racepic/${item.slug}`}
              className="block rounded-xl border bg-card p-6 text-left font-heading text-xl font-bold uppercase tracking-tight transition hover:border-accent"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}

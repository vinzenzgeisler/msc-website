import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { RacePicWordmark } from '@/components/racepic/RacePicWordmark';
import {
  fetchDiscoverFeed,
  fetchPublishedEvents,
  fetchSearchIndex,
  toCdnUrl,
  type RacePicDiscoverImage,
  type RacePicEventSummary,
  type RacePicSearchIndexEntry,
} from '@/integrations/racepic/publicClient';

const INITIAL_GRID_SIZE = 20;
const GRID_PAGE_SIZE = 20;

/**
 * RacePic-Startseite (Paket 8, neu im Unsplash/Airbnb-Stil in Paket 17 - siehe
 * racepic-ux-redesign-plan.md): große, zentrierte Suche mit event-übergreifender Autocomplete
 * (gegen `search-index.json`) und darunter ein Masonry-artiges Grid mit Bildvorschlägen
 * (`discover.json`) zum Weiterscrollen/-laden.
 */
export default function RacePicHomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<RacePicSearchIndexEntry[] | null>(null);
  const [discover, setDiscover] = useState<RacePicDiscoverImage[] | null>(null);
  const [events, setEvents] = useState<RacePicEventSummary[]>([]);
  const [error, setError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_GRID_SIZE);

  useEffect(() => {
    fetchSearchIndex()
      .then(setSearchIndex)
      .catch(() => setSearchIndex([]));
    fetchDiscoverFeed()
      .then(setDiscover)
      .catch(() => setError(true));
    fetchPublishedEvents()
      .then(setEvents)
      .catch(() => undefined);
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized || !searchIndex) return [];
    return searchIndex
      .filter((entry) =>
        `${entry.startNumber} ${entry.displayName} ${entry.make ?? ''} ${entry.model ?? ''} ${entry.className} ${entry.eventTitle}`
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 8);
  }, [query, searchIndex]);

  const goToResult = (entry: RacePicSearchIndexEntry) => {
    navigate(`/racepic/${entry.eventSlug}/${entry.participantKey}`);
  };

  return (
    <MainLayout
      title="RacePic"
      description="Finde alle Bilder deines Fahrzeugs von unseren Motorsportveranstaltungen."
      canonicalPath="/racepic"
    >
      <section className="border-b bg-gradient-to-b from-muted/60 to-background py-16 text-center sm:py-24">
        <div className="container max-w-2xl">
          <RacePicWordmark size="lg" className="mx-auto" />
          <p className="mt-4 text-lg text-muted-foreground">
            Finde alle Bilder deines Fahrzeugs – zentral, statt in einzelnen Fotografengalerien zu suchen.
          </p>

          <div className="relative mx-auto mt-8 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-14 rounded-full pl-12 text-base shadow-lg"
              placeholder="Name, Startnummer oder Fahrzeug suchen…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {results.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border bg-card text-left shadow-xl">
                {results.map((entry) => (
                  <button
                    key={`${entry.eventSlug}-${entry.participantKey}`}
                    type="button"
                    onClick={() => goToResult(entry)}
                    className="block w-full border-b px-4 py-3 text-sm last:border-b-0 hover:bg-muted"
                  >
                    <span className="font-medium">
                      #{entry.startNumber} {entry.displayName}
                    </span>
                    <span className="ml-2 text-muted-foreground">
                      {entry.make} {entry.model} · {entry.eventTitle}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {events.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {events.map((item) => (
                <Link
                  key={item.eventId}
                  to={`/racepic/${item.slug}`}
                  className="rounded-full border bg-card px-4 py-1.5 text-sm font-medium transition hover:border-accent"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container py-12">
        {!discover && !error && <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />}
        {error && <p className="text-center text-muted-foreground">RacePic ist aktuell nicht erreichbar.</p>}
        {discover && discover.length === 0 && (
          <p className="text-center text-muted-foreground">Noch keine Bilder veröffentlicht.</p>
        )}
        {discover && discover.length > 0 && (
          <>
            <div className="columns-2 gap-3 sm:columns-3 md:columns-4 [&>*]:mb-3">
              {discover.slice(0, visibleCount).map((image) => (
                <Link
                  key={image.imageId}
                  to={`/racepic/${image.eventSlug}`}
                  className="group block overflow-hidden rounded-lg border bg-muted"
                  title={image.eventTitle}
                >
                  <img
                    src={toCdnUrl(image.thumbUrl)}
                    alt=""
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
            {visibleCount < discover.length && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + GRID_PAGE_SIZE)}
                  className="rounded-full border px-6 py-2 text-sm font-medium transition hover:border-accent"
                >
                  Mehr laden
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </MainLayout>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';
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
const LIVE_SUGGESTION_LIMIT = 8;

/**
 * RacePic-Startseite (Paket 8, neu im Unsplash/Airbnb-Stil in Paket 17 - siehe
 * racepic-ux-redesign-plan.md): große, zentrierte Suche mit event-übergreifender Autocomplete
 * (gegen `search-index.json`) und darunter ein Masonry-artiges Grid mit Bildvorschlägen
 * (`discover.json`) zum Weiterscrollen/-laden.
 *
 * Die frühere separate Event-Seite ("/racepic/:eventSlug") wurde entfernt (Feedback
 * 2026-09-22: "die brauch es ja aber nicht ... weil das ja über Filter gemacht werden soll") -
 * das Filtern nach Event passiert stattdessen hier über die Event-Chips bzw. den
 * "?event=<slug>"-Query-Parameter, mit dem auch von außen (Fotografenprofil,
 * Teilnehmer-Breadcrumb) direkt hierher verlinkt wird.
 */
export default function RacePicHomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  // Wird nur beim Drücken von Enter gesetzt (siehe handleSearchKeyDown) - zeigt dann alle
  // Treffer statt nur der kurzen Live-Vorschlagsliste (Feedback 2026-09-22: "das Suchfeld soll
  // mit Enter auch alle möglichen Treffer smart anzeigen").
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<RacePicSearchIndexEntry[] | null>(null);
  const [discover, setDiscover] = useState<RacePicDiscoverImage[] | null>(null);
  const [events, setEvents] = useState<RacePicEventSummary[]>([]);
  const [error, setError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_GRID_SIZE);
  // Event-Chips (und Klicks auf ein Discover-Bild) filtern das Grid auf dieser Seite, statt zur
  // alten Event-Seite zu navigieren - kein Nachladen nötig, `discover`/`searchIndex` sind bereits
  // komplett geladen. Initialwert kommt aus "?event=<slug>", damit externe Links (Fotografenprofil,
  // Teilnehmer-Breadcrumb) direkt gefiltert landen.
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(() => searchParams.get('event'));

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

  const liveSuggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized || !searchIndex) return [];
    return searchIndex
      .filter((entry) =>
        `${entry.startNumber} ${entry.displayName} ${entry.make ?? ''} ${entry.model ?? ''} ${entry.className} ${entry.eventTitle}`
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, LIVE_SUGGESTION_LIMIT);
  }, [query, searchIndex]);

  const submittedResults = useMemo(() => {
    const normalized = submittedQuery.trim().toLowerCase();
    if (!normalized || !searchIndex) return [];
    return searchIndex.filter((entry) => {
      if (selectedEventSlug && entry.eventSlug !== selectedEventSlug) return false;
      return `${entry.startNumber} ${entry.displayName} ${entry.make ?? ''} ${entry.model ?? ''} ${entry.className} ${entry.eventTitle}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [submittedQuery, searchIndex, selectedEventSlug]);

  const goToResult = (entry: RacePicSearchIndexEntry) => {
    navigate(`/racepic/${entry.eventSlug}/${entry.participantKey}`);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setSubmittedQuery(query);
    } else if (event.key === 'Escape') {
      setQuery('');
      setSubmittedQuery('');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSubmittedQuery('');
  };

  const visibleDiscover = useMemo(
    () => (selectedEventSlug ? (discover ?? []).filter((image) => image.eventSlug === selectedEventSlug) : (discover ?? [])),
    [discover, selectedEventSlug],
  );

  const setEventFilter = (slug: string | null) => {
    setVisibleCount(INITIAL_GRID_SIZE);
    setSelectedEventSlug(slug);
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (slug) next.set('event', slug);
        else next.delete('event');
        return next;
      },
      { replace: true },
    );
  };

  const toggleEventFilter = (slug: string) => {
    setEventFilter(selectedEventSlug === slug ? null : slug);
  };

  const isSearching = submittedQuery.trim().length > 0;

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
              className="h-14 rounded-full pl-12 pr-12 text-base shadow-lg"
              placeholder="Name, Startnummer oder Fahrzeug suchen… (Enter für alle Treffer)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (submittedQuery) setSubmittedQuery('');
              }}
              onKeyDown={handleSearchKeyDown}
            />
            {(query || isSearching) && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Suche zurücksetzen"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {!isSearching && liveSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border bg-card text-left shadow-xl">
                {liveSuggestions.map((entry) => (
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
                <button
                  key={item.eventId}
                  type="button"
                  onClick={() => toggleEventFilter(item.slug)}
                  className={
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition ' +
                    (selectedEventSlug === item.slug
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'bg-card hover:border-accent')
                  }
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {isSearching ? (
        <section className="container py-12">
          <p className="text-center text-sm text-muted-foreground">
            {submittedResults.length} Treffer für „{submittedQuery}“
            {selectedEventSlug && ` · gefiltert auf ${events.find((e) => e.slug === selectedEventSlug)?.title ?? selectedEventSlug}`}
          </p>
          {submittedResults.length === 0 && (
            <p className="mt-6 text-center text-muted-foreground">Keine Treffer. Versuche einen anderen Namen, eine Startnummer oder ein Fahrzeug.</p>
          )}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {submittedResults.map((entry) => (
              <button
                key={`${entry.eventSlug}-${entry.participantKey}`}
                type="button"
                onClick={() => goToResult(entry)}
                className="group rounded-xl border bg-card p-4 text-left transition hover:border-accent"
              >
                <p className="font-heading font-bold">
                  #{entry.startNumber} {entry.displayName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {entry.make} {entry.model} · {entry.className}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{entry.eventTitle}</p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="container py-12">
          {!discover && !error && <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />}
          {error && <p className="text-center text-muted-foreground">RacePic ist aktuell nicht erreichbar.</p>}
          {discover && discover.length === 0 && (
            <p className="text-center text-muted-foreground">Noch keine Bilder veröffentlicht.</p>
          )}
          {discover && discover.length > 0 && visibleDiscover.length === 0 && (
            <p className="text-center text-muted-foreground">Noch keine Bilder für dieses Event.</p>
          )}
          {discover && visibleDiscover.length > 0 && (
            <>
              <div className="columns-2 gap-3 sm:columns-3 md:columns-4 [&>*]:mb-3">
                {visibleDiscover.slice(0, visibleCount).map((image) => (
                  <button
                    key={image.imageId}
                    type="button"
                    onClick={() => toggleEventFilter(image.eventSlug)}
                    className="group block w-full overflow-hidden rounded-lg border bg-muted text-left"
                    title={image.eventTitle}
                  >
                    <img
                      src={toCdnUrl(image.thumbUrl)}
                      alt=""
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
              {visibleCount < visibleDiscover.length && (
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
      )}
    </MainLayout>
  );
}

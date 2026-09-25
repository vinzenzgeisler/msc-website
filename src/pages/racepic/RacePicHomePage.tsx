import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { RacePicWordmark } from '@/components/racepic/RacePicWordmark';
import { RacePicImageDialog } from '@/components/racepic/RacePicImageDialog';
import { useRacePicText } from '@/i18n/racepic';
import {
  fetchDiscoverFeed,
  fetchDiscoverIndex,
  fetchDiscoverPage,
  fetchPublishedEvents,
  fetchSearchIndex,
  toCdnUrl,
  type RacePicDiscoverImage,
  type RacePicDiscoverIndex,
  type RacePicEventSummary,
  type RacePicSearchIndexEntry,
} from '@/integrations/racepic/publicClient';

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
  const t = useRacePicText();
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
  const [discoverIndex, setDiscoverIndex] = useState<RacePicDiscoverIndex | null>(null);
  const [loadedPage, setLoadedPage] = useState(1);
  const [pagePending, setPagePending] = useState(false);
  // Event-Chips (und Klicks auf ein Discover-Bild) filtern das Grid auf dieser Seite, statt zur
  // alten Event-Seite zu navigieren - kein Nachladen nötig, `discover`/`searchIndex` sind bereits
  // komplett geladen. Initialwert kommt aus "?event=<slug>", damit externe Links (Fotografenprofil,
  // Teilnehmer-Breadcrumb) direkt gefiltert landen.
  const [selectedEventSlug, setSelectedEventSlug] = useState<string | null>(() => searchParams.get('event'));
  // Klick auf ein Vorschaubild öffnet es groß (Feedback 2026-09-22: "unter /racepic soll man auf
  // die Vorschaubilder direkt auch drücken können") - Discover-Bilder haben keine participantKey,
  // eine Lightbox statt einer eigenen Detailseite reicht hier aus.
  const photoParam = searchParams.get('photo');
  const separator = photoParam?.lastIndexOf('.') ?? -1;
  const selectedPhoto = photoParam && separator > 0
    ? { eventSlug: photoParam.slice(0, separator), imageId: photoParam.slice(separator + 1) }
    : null;

  const selectPhoto = (image: { eventSlug: string; imageId: string } | null) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (image) next.set('photo', `${image.eventSlug}.${image.imageId}`);
      else next.delete('photo');
      return next;
    });
  };

  useEffect(() => {
    fetchSearchIndex()
      .then(setSearchIndex)
      .catch(() => setSearchIndex([]));
    fetchDiscoverFeed()
      .then(setDiscover)
      .catch(() => setError(true));
    fetchDiscoverIndex().then(setDiscoverIndex).catch(() => undefined);
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

  const loadMore = useCallback(async () => {
    if (pagePending || !discoverIndex || loadedPage >= discoverIndex.pageCount) return;
    setPagePending(true);
    try {
      const nextPage = loadedPage + 1;
      const page = await fetchDiscoverPage(nextPage);
      setDiscover((previous) => [...(previous ?? []), ...page]);
      setLoadedPage(nextPage);
    } catch { setError(true); }
    finally { setPagePending(false); }
  }, [discoverIndex, loadedPage, pagePending]);

  // Ein Event kann auf Seite 1 der globalen Entdeckung fehlen. Beim Filtern so lange
  // nachladen, bis Bilder dieses Events sichtbar sind oder alle Seiten geprüft wurden.
  useEffect(() => {
    if (selectedEventSlug && discover && visibleDiscover.length === 0 && !pagePending && discoverIndex && loadedPage < discoverIndex.pageCount) {
      void loadMore();
    }
  }, [selectedEventSlug, discover, visibleDiscover.length, pagePending, discoverIndex, loadedPage, loadMore]);

  return (
    <MainLayout
      title="RacePic"
      description={t.tagline}
      canonicalPath="/racepic"
    >
      <section className="border-b bg-gradient-to-br from-muted/80 via-background to-accent/10 py-14 text-center sm:py-20">
        <div className="container max-w-2xl">
          <RacePicWordmark size="lg" className="mx-auto" />
          <p className="mt-4 text-lg text-muted-foreground">
            {t.tagline}
          </p>

          <div className="relative mx-auto mt-8 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-14 rounded-full pl-12 pr-12 text-base shadow-lg"
              placeholder={t.searchPlaceholder}
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
                aria-label={t.resetSearch}
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
        <section className="container py-8 sm:py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-widest text-accent">{t.discover}</p><h2 className="font-heading text-2xl font-bold sm:text-3xl">{t.moments}</h2></div>
            {discoverIndex && <p className="text-sm text-muted-foreground">{discoverIndex.total} {t.images}</p>}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {submittedResults.length} {t.results} „{submittedQuery}“
            {selectedEventSlug && ` · gefiltert auf ${events.find((e) => e.slug === selectedEventSlug)?.title ?? selectedEventSlug}`}
          </p>
          {submittedResults.length === 0 && (
            <p className="mt-6 text-center text-muted-foreground">{t.noResults}</p>
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
          {error && <p className="text-center text-muted-foreground">{t.unavailable}</p>}
          {discover && discover.length === 0 && (
            <p className="text-center text-muted-foreground">{t.noImages}</p>
          )}
          {discover && discover.length > 0 && visibleDiscover.length === 0 && loadedPage >= (discoverIndex?.pageCount ?? 1) && (
            <p className="text-center text-muted-foreground">{t.noEventImages}</p>
          )}
          {discover && visibleDiscover.length > 0 && (
            <>
              <div className="columns-2 gap-3 sm:columns-3 md:columns-4 [&>*]:mb-3">
                {visibleDiscover.map((image) => (
                  <button
                    key={image.imageId}
                    type="button"
                    onClick={() => selectPhoto(image)}
                    className="group relative block w-full overflow-hidden rounded-xl bg-muted text-left shadow-sm transition-shadow hover:shadow-xl"
                    title={image.eventTitle}
                  >
                    <img
                      src={toCdnUrl(image.thumbUrl)}
                      alt=""
                      loading="lazy"
                      className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-9 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{image.eventTitle}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {discoverIndex && loadedPage < discoverIndex.pageCount && <div className="mt-8 text-center"><button type="button" onClick={loadMore} disabled={pagePending} className="rounded-full border px-7 py-3 text-sm font-semibold transition hover:border-accent disabled:opacity-50">{pagePending ? t.loading : t.loadMore}</button></div>}
        </section>
      )}

      <RacePicImageDialog selected={selectedPhoto} onSelect={selectPhoto} onClose={() => selectPhoto(null)} />
    </MainLayout>
  );
}

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";
import { EventTrackMap } from "@/components/event/EventTrackMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMainEvent } from "@/hooks/useMainEvent";
import { useEventContent } from "@/hooks/useEventContent";
import { useEventLiveNotices } from "@/hooks/useEventHub";
import { useEventHubVoting } from "@/hooks/useEventHubVoting";
import { VotingSection, VotingStickyButton } from "@/components/event/voting/VotingSection";
import { HighlightsSection } from "@/components/event/highlights/HighlightsSection";
import { DayScheduleBlocks } from "@/components/event/schedule/DayScheduleBlocks";
import { useDownloads } from "@/hooks/useDownloads";
import { useSponsors } from "@/hooks/useSponsors";
import { MainSponsorMarquee } from "@/components/sponsors/SponsorDisplays";
import { useMediaAlbums, useMediaFiles } from "@/hooks/useMedia";
import {
  useContentWithFallback,
  useSectionContent,
} from "@/hooks/usePageContent";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/i18n/LanguageContext";
import { getDateFnsLocale } from "@/i18n/locale-utils";
import { parseSelectedDownloadIds } from "@/lib/download-selection";
import {
  formatCountdown,
  resolveEventPhase,
  resolveLiveScheduleState,
} from "@/lib/event-hub";
import type { EventSchedule } from "@/integrations/pocketbase/client";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleParking,
  Clock3,
  Download,
  ExternalLink,
  Flag,
  Image,
  Info,
  Map,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function fallbackSchedule(eventId: string): EventSchedule[] {
  const rows = [
    ["08:00", "08:20", "Klassen 1 + 2 + 3", "Rennmotorräder"],
    ["08:25", "08:45", "Klasse 4", "Rennmotorräder"],
    ["08:50", "09:10", "Klasse 12", "Trabantklasse"],
    ["09:10", "09:25", "Pause", ""],
    ["09:25", "09:45", "Klasse 7", "Seitenwagen"],
    ["09:50", "10:10", "Klasse 5", "Rennmotorräder"],
    ["10:15", "10:35", "Klasse 10", "Tourenwagen"],
    ["10:40", "11:05", "Sonderlauf + Renntaxi", ""],
    ["11:05", "11:20", "Pause", ""],
    ["11:20", "11:40", "Klasse 6", "Rennmotorräder"],
    ["11:45", "12:05", "Klasse 9", "Formelwagen"],
    ["12:10", "12:30", "Klasse 8", "Rennmotorräder"],
    ["12:30", "13:10", "Mittagspause", ""],
    ["13:10", "13:30", "Klassen 1 + 2 + 3", "Rennmotorräder"],
    ["13:35", "13:55", "Klasse 4", "Rennmotorräder"],
    ["14:00", "14:20", "Klasse 12", "Trabantklasse"],
    ["14:20", "14:35", "Pause", ""],
    ["14:35", "14:55", "Klasse 7", "Seitenwagen"],
    ["15:00", "15:20", "Klasse 5", "Rennmotorräder"],
    ["15:25", "15:45", "Klasse 10", "Tourenwagen"],
    ["15:50", "16:15", "Sonderlauf + Renntaxi", ""],
    ["16:15", "16:30", "Pause", ""],
    ["16:30", "16:50", "Klasse 6", "Rennmotorräder"],
    ["16:55", "17:15", "Klasse 9", "Formelwagen"],
    ["17:20", "17:40", "Klasse 8", "Rennmotorräder"],
  ];
  return ["2026-09-12", "2026-09-13"].map((date, dayIndex) => {
    const dayRows = dayIndex
      ? rows
      : [...rows, ["17:45", "18:15", "Renntaxi", ""]];
    const utc = (time: string) =>
      `${date}T${String(Number(time.slice(0, 2)) - 2).padStart(2, "0")}:${time.slice(3)}:00Z`;
    return {
      id: `fallback-${dayIndex}`,
      event: eventId,
      day_label: dayIndex ? "Sonntag" : "Samstag",
      day_number: dayIndex + 1,
      locale: "de",
      date,
      after_program_note: dayIndex
        ? null
        : "Anschließend Live-Musik im Festzelt.",
      entries: dayRows.map(([start, end, title, subtitle], index) => ({
        id: `fallback-${dayIndex}-${index}`,
        time: start,
        title,
        subtitle,
        start_dt: utc(start),
        end_dt: utc(end),
        entry_type: title.toLowerCase().includes("pause")
          ? "pause"
          : title.includes("Renntaxi")
            ? "highlight"
            : "program",
      })),
    };
  });
}

export default function EventHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { locale } = useLanguage();
  const actualNow = useNow();
  const previewPhase = import.meta.env.DEV
    ? searchParams.get("previewPhase")
    : null;
  const now =
    previewPhase === "live" ? new Date("2026-09-12T08:00:00Z") : actualNow;
  const { data: event, isLoading } = useMainEvent();
  const { data: content } = useEventContent(event?.id);
  const { data: notices } = useEventLiveNotices(event?.id);
  const { data: downloads } = useDownloads();
  const { data: sponsors } = useSponsors();
  const { data: settings } = useSettings();
  const { data: albums } = useMediaAlbums();
  const { votingEnabled } = useEventHubVoting();
  const { data: selectedDownloadsContent } = useSectionContent(
    "event",
    "downloads",
  );
  const locationMap = useContentWithFallback("event", "location_map", {
    title: "",
    content: "",
  });
  const trackMap = useContentWithFallback("event", "track_map", {
    title: "Streckenkarte",
    content: "",
  });
  const siteMap = useContentWithFallback("event", "visitors_site_map", {
    title: "Lageplan",
    content: "",
  });
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const resolvedPhase = event ? resolveEventPhase(now, event) : "pre";
  const phase =
    previewPhase === "pre" || previewPhase === "live" || previewPhase === "post"
      ? previewPhase
      : resolvedPhase;
  const schedules = content?.schedules?.some((day) =>
    day.entries.some((entry) => Boolean(entry.title)),
  )
    ? content.schedules
    : fallbackSchedule(event?.id || "fallback");
  const live = resolveLiveScheduleState(now, schedules);
  const [activeScheduleId, setActiveScheduleId] = useState(
    schedules[0]?.id || "",
  );
  useEffect(() => {
    if (!schedules.some((day) => day.id === activeScheduleId))
      setActiveScheduleId(live.day?.id || schedules[0]?.id || "");
  }, [activeScheduleId, live.day?.id, schedules]);
  const countdown = event
    ? formatCountdown(event.live_start_dt || event.start_dt, now)
    : null;
  const galleryAlbum = albums?.find(
    (album) => album.slug === `event-${event?.slug}`,
  );
  const { data: galleryFiles, isLoading: galleryLoading } = useMediaFiles(
    galleryAlbum?.id,
  );
  const mainSponsors = (sponsors || []).filter(
    (item) => item.active && item.tier === "main",
  );
  const selectedIds = parseSelectedDownloadIds(
    selectedDownloadsContent?.content,
  );
  const selectedDownloads = selectedIds
    .map((id) => downloads?.find((item) => item.id === id))
    .filter(Boolean);
  const visibleDownloads = selectedDownloads.length
    ? selectedDownloads
    : (downloads || []).filter((item) => item.category === "event");
  const mapLink =
    locationMap.primary_button_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event?.location || "Oberlausitzer Dreieck")}`;
  const dateLocale = getDateFnsLocale(locale);
  const dateText = event
    ? `${format(new Date(event.start_dt), "d.", { locale: dateLocale })}/${format(new Date(event.end_dt || event.start_dt), "d. MMMM yyyy", { locale: dateLocale })}`
    : "12./13. September 2026";
  const schema = event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: event.description || undefined,
        startDate: event.start_dt,
        endDate: event.end_dt || undefined,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: { "@type": "Place", name: event.location },
        organizer: {
          "@type": "Organization",
          name: settings?.site_name || "MSC Oberlausitzer Dreiländereck e.V.",
        },
      }
    : undefined;

  const scheduleSection = (
    <section id="schedule" className="bg-muted/40 py-20 md:py-28">
      <div className="container max-w-5xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading kicker="Programm 2026" title="Zeitplan" />
          <p className="max-w-lg text-sm text-muted-foreground">
            Kurzfristige Änderungen werden hier und im Live-Status angezeigt.
          </p>
        </div>
        <Tabs value={activeScheduleId} onValueChange={setActiveScheduleId}>
          <TabsList className="mb-8 grid h-12 w-full max-w-sm grid-cols-2 rounded-none bg-transparent p-0">
            {schedules.map((day) => (
              <TabsTrigger
                key={day.id}
                value={day.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
              >
                {day.day_label}
              </TabsTrigger>
            ))}
          </TabsList>
          {schedules.map((day) => (
            <TabsContent key={day.id} value={day.id} className="m-0">
              <div className="bg-background px-5 py-2 md:px-8">
                <DayScheduleBlocks day={day} isLive={phase === "live"} currentEntryId={live.current?.id} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );

  return (
    <MainLayout
      title={event?.title || "Oberlausitzer Dreieck"}
      description={event?.description || undefined}
      canonicalPath="/event"
      structuredData={schema}
    >
      {import.meta.env.DEV && (
        <div
          className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-1 border border-border bg-background p-1 shadow-xl"
          aria-label="Event-Phasenvorschau"
        >
          <span className="hidden px-2 text-xs font-bold uppercase text-muted-foreground sm:inline">
            Vorschau
          </span>
          {(["pre", "live", "post"] as const).map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={
                phase === item && previewPhase === item ? "default" : "ghost"
              }
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("previewPhase", item);
                setSearchParams(next, { replace: true });
              }}
            >
              {item.toUpperCase()}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={!previewPhase ? "secondary" : "ghost"}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete("previewPhase");
              setSearchParams(next, { replace: true });
            }}
          >
            AUTO
          </Button>
        </div>
      )}
      <section className="relative min-h-[460px] overflow-hidden bg-[#111827] text-white md:min-h-[500px]">
        <img
          src="https://backend.msc-oberlausitz.de/api/files/pbc_2526955808/t48pa6itcliieot/whats_app_image_2026_08_07_at_10_00_93mecy9y97.532.jpeg"
          alt="Motorräder auf der Strecke des Oberlausitzer Dreiecks"
          className="absolute inset-0 h-full w-full object-cover object-[45%_center] md:object-[50%_58%]"
        />
        <div className="absolute inset-0 bg-black/45 md:bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/20" />
        <div className="container relative flex min-h-[460px] max-w-5xl flex-col justify-start pb-10 pt-24 md:min-h-[500px] md:pt-28">
          {isLoading ? (
            <Skeleton className="h-40 w-full max-w-3xl bg-white/20" />
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-center gap-3 text-sm font-semibold">
                <span
                  className={
                    phase === "live"
                      ? "flex items-center text-red-300"
                      : "text-accent"
                  }
                >
                  {phase === "live" && (
                    <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-white" />
                  )}
                  {phase === "pre"
                    ? "Demnächst"
                    : phase === "live"
                      ? "Live"
                      : "Rückblick"}
                </span>
                <span className="h-4 w-px bg-white/40" />
                <span className="text-white/80">{dateText}</span>
              </div>
              <h1 className="max-w-4xl text-4xl font-black uppercase leading-[0.98] sm:text-6xl md:text-7xl">
                {event?.title || "Oberlausitzer Dreieck"}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
                {event?.description ||
                  "Historischer Motorsport auf der legendären Strecke im Zittauer Gebirge."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/60 bg-black/20 text-white hover:bg-white hover:text-black"
                  asChild
                >
                  <a href={phase === "live" ? "#live" : "#schedule"}>
                    {phase === "live" ? "Live-Status" : "Programm ansehen"}
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
      <section className="bg-background">
        <div className="container grid max-w-5xl grid-cols-2 border-b border-border md:grid-cols-4">
          {phase === "pre" ? (
            <Fact
              icon={Clock3}
              label="Start in"
              value={`${countdown?.days || 0} T ${countdown?.hours || 0} Std ${countdown?.minutes || 0} Min`}
            />
          ) : (
            <Fact
              icon={Flag}
              label="Status"
              value={
                phase === "live"
                  ? "Veranstaltung läuft"
                  : "Veranstaltung beendet"
              }
            />
          )}
          <Fact
            icon={Ticket}
            label="Tagesticket"
            value={`${event?.day_ticket_price ?? 10} EUR`}
          />
          <Fact
            icon={Ticket}
            label="Wochenende"
            value={`${event?.weekend_ticket_price ?? 15} EUR`}
          />
          <Fact
            icon={CircleParking}
            label="Parken"
            value={
              event?.parking_free === false ? "Hinweise beachten" : "Kostenlos"
            }
          />
        </div>
      </section>
      {phase === "live" && (
        <section id="live" className="bg-[#111827] py-10 text-white">
          <div className="container max-w-5xl">
            <div className="grid border-y border-white/20 md:grid-cols-[1.5fr_1fr]">
              <div className="py-6 md:border-r md:border-white/20 md:pr-8">
                <p className="text-xs font-bold uppercase text-white/60">
                  {live.state === "running"
                    ? "Jetzt auf der Strecke"
                    : live.state === "pause"
                      ? "Pause"
                      : live.state === "before_day"
                        ? "Programm startet bald"
                        : "Tagesprogramm beendet"}
                </p>
                <p className="mt-2 text-2xl font-black">
                  {live.current?.title ||
                    live.day?.after_program_note ||
                    "Nächster Veranstaltungstag folgt"}
                </p>
                {live.current?.subtitle && (
                  <p className="text-white/70">{live.current.subtitle}</p>
                )}
              </div>
              <div className="border-t border-white/20 py-6 md:border-t-0 md:pl-8">
                <p className="text-xs font-bold uppercase text-white/60">
                  Als Nächstes
                </p>
                <p className="mt-2 text-lg font-bold">
                  {live.next
                    ? `${live.next.time} · ${live.next.title}`
                    : "Keine weiteren Programmpunkte"}
                </p>
              </div>
            </div>
            {(notices || []).map((notice) => (
              <div
                key={notice.id}
                className={`mt-3 flex gap-3 border p-4 ${notice.severity === "warning" ? "border-amber-400 bg-amber-400/10" : "border-white/20 bg-white/5"}`}
              >
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <strong>{notice.title}</strong>
                  {notice.message && (
                    <p className="text-sm text-white/75">{notice.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <nav
        className={`z-30 border-b border-border bg-background/95 backdrop-blur ${phase === "live" ? "sticky top-0" : ""}`}
      >
        <div className="container flex max-w-5xl gap-7 overflow-x-auto py-4">
          {[
            ["#schedule", "Zeitplan"],
            ["#visitors", "Besucher"],
            ["#downloads", "Downloads"],
            ["#track", "Strecke"],
            ["#gallery", "Galerie"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
      {phase === "live" && event?.show_voting !== false && votingEnabled && (
        <section className="py-20 md:py-24">
          <div className="container max-w-5xl">
            {event?.show_drivers !== false && <HighlightsSection />}
            <VotingSection priorityClassIds={live.current?.backend_class_ids ?? []} />
          </div>
        </section>
      )}
      {phase !== "post" && scheduleSection}
      {phase !== "post" &&
        (event?.show_drivers !== false || event?.show_voting !== false) &&
        (phase === "pre" || !votingEnabled) && (
        <section className="py-20 md:py-24">
          <div className="container grid max-w-5xl border-y border-border md:grid-cols-2 md:divide-x md:divide-border">
            {event?.show_drivers !== false && (
              <UpcomingPanel
                icon={Users}
                title="Fahrer & Fahrzeuge"
                text="Teilnehmerfeld und Fahrzeuge werden nach Freigabe veröffentlicht."
              />
            )}
            {event?.show_voting !== false && (
              <UpcomingPanel
                icon={Sparkles}
                title="Publikumsvoting"
                text="Das Voting wird zum passenden Zeitpunkt hier freigeschaltet."
              />
            )}
          </div>
        </section>
      )}
      {phase === "post" && event?.show_voting !== false && votingEnabled && (
        <section className="py-20 md:py-24">
          <div className="container max-w-5xl">
            <VotingSection />
          </div>
        </section>
      )}
      <VotingStickyButton />
      {mainSponsors.length > 0 && (
        <section className="bg-muted/40 py-16">
          <div className="container max-w-5xl">
            <MainSponsorMarquee
              sponsors={mainSponsors}
              title="Hauptsponsoren"
              subtitle="Partner des Oberlausitzer Dreiecks"
              ctaPosition={`event_hub_${phase}_sponsor_marquee`}
              large
            />
          </div>
        </section>
      )}
      <section id="visitors" className="py-20 md:py-28">
        <div className="container max-w-5xl">
          <SectionHeading kicker="Vor Ort" title="Besucherinformationen" />
          <div className="grid border-t border-border md:grid-cols-2 md:gap-x-12">
            <InfoRow icon={Ticket} title="Eintritt">
              Tagesticket {event?.day_ticket_price ?? 10} EUR, Wochenendticket{" "}
              {event?.weekend_ticket_price ?? 15} EUR. Kinder und Jugendliche
              unter {event?.children_free_under ?? 14} Jahren frei.
            </InfoRow>
            <InfoRow icon={CircleParking} title="Parken & Shuttle">
              Ausgeschilderte, kostenlose Parkplätze und Shuttlebusse zu den
              Zuschauerbereichen.
            </InfoRow>
            <InfoRow icon={Users} title="Fahrerlager">
              Beide Fahrerlager sind für Zuschauer zugänglich.
            </InfoRow>
            <InfoRow icon={Camera} title="Fotografen">
              Gekennzeichnete Bereiche dürfen nur mit Akkreditierung betreten
              werden.
            </InfoRow>
          </div>
          {(siteMap.image_url || siteMap.attachment_url) && (
            <a
              href={siteMap.attachment_url || siteMap.image_url || "#"}
              target="_blank"
              rel="noreferrer"
              className="mt-8 flex items-center gap-3 border-t border-border py-5 font-semibold hover:text-primary"
            >
              <Map className="h-5 w-5 text-primary" /> Lageplan öffnen{" "}
              <ExternalLink className="ml-auto h-4 w-4" />
            </a>
          )}
          <details className="group border-t border-border">
            <summary className="flex cursor-pointer items-center gap-3 py-5 font-semibold">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Sicherheit und Bildaufnahmen
              <ChevronDown className="ml-auto h-4 w-4 group-open:rotate-180" />
            </summary>
            <p className="pb-5 pl-8 text-sm text-muted-foreground">
              Absperrungen und Anweisungen der Streckenposten sind jederzeit zu
              beachten. Im Rahmen der Veranstaltung entstehen Bild- und
              Tonaufnahmen für die Öffentlichkeitsarbeit.
            </p>
          </details>
          <Link
            to="/event/accommodation"
            className="mt-10 flex items-center gap-4 bg-[#111827] px-5 py-6 text-white transition-colors hover:bg-primary md:px-7"
          >
            <BedDouble className="h-6 w-6 shrink-0 text-accent" />
            <div>
              <p className="font-semibold">Übernachtungsmöglichkeiten</p>
              <p className="mt-1 text-sm text-white/60">
                Hotels, Pensionen und Ferienwohnungen rund um die Strecke
              </p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 shrink-0" />
          </Link>
        </div>
      </section>
      <section id="downloads" className="bg-muted/40 py-20 md:py-28">
        <div className="container max-w-5xl">
          <SectionHeading kicker="Dokumente" title="Downloads" />
          <div className="grid border-t border-border sm:grid-cols-2 sm:gap-x-10">
            {visibleDownloads.map(
              (download) =>
                download && (
                  <a
                    key={download.id}
                    href={download.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-24 items-center gap-4 border-b border-border py-5 transition-colors hover:text-primary"
                  >
                    <Download className="h-6 w-6 text-primary" />
                    <div className="min-w-0">
                      <p className="font-semibold">{download.title}</p>
                      <p className="text-xs uppercase text-muted-foreground">
                        {download.audience === "general"
                          ? download.file_type || "Datei"
                          : download.audience}
                      </p>
                    </div>
                    <ExternalLink className="ml-auto h-4 w-4 shrink-0" />
                  </a>
                ),
            )}
          </div>
        </div>
      </section>
      <section id="track" className="py-20 md:py-28">
        <div className="container max-w-5xl">
          <SectionHeading kicker="5,9 Kilometer" title="Strecke & Anreise" />
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="border-t border-border">
              <InfoRow icon={Route} title="Oberlausitzer Dreieck">
                Die historische Strecke verbindet Saalendorf, Jonsdorf und
                Waltersdorf im Zittauer Gebirge.
              </InfoRow>
              <InfoRow icon={MapPin} title="Anreise">
                Folgen Sie vor Ort der Veranstaltungs- und
                Parkplatzbeschilderung.
              </InfoRow>
              <Button className="mt-7" asChild>
                <a href={mapLink} target="_blank" rel="noreferrer">
                  Route öffnen <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-muted-foreground">
                Streckenverlauf
              </p>
              {trackMap.image_url ? (
                <img
                  src={trackMap.image_url}
                  alt={trackMap.image_alt || trackMap.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <EventTrackMap />
              )}
            </div>
          </div>
        </div>
      </section>
      <section id="gallery" className="py-20 md:py-28">
        <div className="container max-w-5xl">
          <SectionHeading
            kicker={phase === "post" ? "Rückblick" : "Impressionen"}
            title="Galerie"
          />
          {galleryAlbum && galleryLoading ? (
            <Skeleton className="aspect-[16/6] w-full" />
          ) : galleryFiles?.length ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {galleryFiles.slice(0, 8).map((file, index) => (
                <button
                  key={file.id}
                  onClick={() => setGalleryIndex(index)}
                  className="aspect-[4/3] overflow-hidden bg-muted"
                >
                  <img
                    src={file.file_url}
                    alt={file.alt_text || event?.title || ""}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 border-t border-border py-6 text-muted-foreground">
              <Image className="h-5 w-5" />
              Die Galerie wird ergänzt.
            </div>
          )}
        </div>
      </section>
      {phase === "post" && scheduleSection}
      <Dialog
        open={galleryIndex !== null}
        onOpenChange={(open) => !open && setGalleryIndex(null)}
      >
        <DialogContent className="max-w-6xl border-0 bg-black p-2">
          {galleryIndex !== null && galleryFiles?.[galleryIndex] && (
            <div className="relative">
              <img
                src={galleryFiles[galleryIndex].file_url}
                alt={galleryFiles[galleryIndex].alt_text || ""}
                className="max-h-[85vh] w-full object-contain"
              />
              {galleryFiles.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute left-3 top-1/2"
                    onClick={() =>
                      setGalleryIndex(
                        (galleryIndex - 1 + galleryFiles.length) %
                          galleryFiles.length,
                      )
                    }
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute right-3 top-1/2"
                    onClick={() =>
                      setGalleryIndex((galleryIndex + 1) % galleryFiles.length)
                    }
                  >
                    <ChevronRight />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-28 items-center gap-3 border-r border-border px-4 even:border-r-0 md:px-6 md:even:border-r md:last:border-r-0">
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}
function SectionHeading({
  kicker,
  title,
  invert = false,
}: {
  kicker: string;
  title: string;
  invert?: boolean;
}) {
  return (
    <div className="mb-10">
      <p
        className={`mb-3 text-sm font-semibold ${invert ? "text-accent" : "text-primary"}`}
      >
        {kicker}
      </p>
      <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
    </div>
  );
}
function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Info;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 border-b border-border py-6">
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <div>
        <h3 className="text-base font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
function UpcomingPanel({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Users;
  title: string;
  text: string;
}) {
  return (
    <div className="py-8 md:px-10 first:md:pl-0 last:md:pr-0">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="ml-auto text-xs font-semibold text-muted-foreground">
          Demnächst
        </span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

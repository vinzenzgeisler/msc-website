import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useTranslation, useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, ChevronLeft, ChevronRight, Download, List, CalendarDays, CalendarX, Star } from "lucide-react";
import { de, cs, enUS } from "date-fns/locale";
import { format, isSameMonth, isSameDay, isAfter, startOfDay } from "date-fns";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useContentWithFallback } from '@/hooks/usePageContent';
import { downloadIcs } from '@/lib/ics-export';
import { toast } from 'sonner';
import { getCalendarEventClickTarget } from '@/lib/calendar-event-links';

type ViewMode = "month" | "upcoming";

// Category colors only - labels come from translations
const categoryColors: Record<string, { color: string; bgColor: string }> = {
  all: { color: "text-white", bgColor: "bg-slate-500" },
  touring: { color: "text-white", bgColor: "bg-slate-500" },
  motorradtouristik: { color: "text-white", bgColor: "bg-slate-500" },
  club: { color: "text-primary-foreground", bgColor: "bg-primary" },
  verein: { color: "text-primary-foreground", bgColor: "bg-primary" },
  event: { color: "text-accent-foreground", bgColor: "bg-accent" },
  veranstaltung: { color: "text-accent-foreground", bgColor: "bg-accent" },
  training: { color: "text-white", bgColor: "bg-green-600" },
  orgTeam: { color: "text-white", bgColor: "bg-purple-600" },
  orgteam: { color: "text-white", bgColor: "bg-purple-600" },
  orga: { color: "text-white", bgColor: "bg-purple-600" },
};


export default function CalendarPage() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("upcoming");
  const navigate = useNavigate();
  
  // Filter events by current locale
  const { data: events, isLoading } = useCalendarEvents(true);
  const intro = useContentWithFallback('calendar', 'intro', {
    title: t.calendar.title,
    subtitle: t.calendar.subtitle,
  });

  const today = startOfDay(new Date());
  
  // Get the appropriate date-fns locale
  const dateLocale = locale === 'de' ? de : locale === 'cz' ? cs : enUS;
  const fullDateFormat = locale === 'en' ? 'MMMM d, yyyy' : 'd. MMMM yyyy';
  const monthLabelFormat = locale === 'en' ? 'LLL' : 'MMM';
  const timeFormat = locale === 'en' ? 'h:mm a' : 'HH:mm';

  // Filter and sort events
  const filteredEvents = (events || [])
    .filter((event) => event.published !== false)
    .filter((event) => activeFilter === "all" || event.category === activeFilter)
    .filter((event) => {
      if (viewMode === "upcoming") {
        return isAfter(new Date(event.start_dt), today) || isSameDay(new Date(event.start_dt), today);
      }
      if (selectedDate) {
        return isSameDay(new Date(event.start_dt), selectedDate);
      }
      return isSameMonth(new Date(event.start_dt), currentMonth);
    })
    .sort((a, b) => new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime());

  // Get dates that have events for highlighting in calendar
  const eventDates = (events || []).map((e) => new Date(e.start_dt));

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newMonth;
    });
    setSelectedDate(undefined);
  };

  const getCategoryColors = (category: string | null) => {
    const cat = category?.toLowerCase() || 'all';
    return categoryColors[cat] || categoryColors.all;
  };

  const getCategoryLabel = (category: string): string => {
    const filterKey = category as keyof typeof t.calendar.filter;
    return t.calendar.filter[filterKey] || category;
  };

  // Unique categories from events
  const availableCategories = ['all', ...new Set((events || []).map(e => e.category).filter(Boolean))];

  return (
    <MainLayout title={intro.title} description={intro.subtitle || undefined}>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2">{intro.title}</h1>
          <p className="text-lg text-primary-foreground/80">{intro.subtitle}</p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="border-b border-border bg-muted/50 py-4">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{t.calendar.view}:</span>
              <Button
                variant={viewMode === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("upcoming");
                  setSelectedDate(undefined);
                }}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">{t.calendar.viewListFull}</span>
                <span className="sm:hidden">{t.calendar.viewList}</span>
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("month")}
                className="gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">{t.calendar.viewMonthFull}</span>
                <span className="sm:hidden">{t.calendar.viewMonth}</span>
              </Button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{t.calendar.category}:</span>
              {availableCategories.map((cat) => {
                const colors = getCategoryColors(cat);
                return (
                  <Button
                    key={cat}
                    variant={activeFilter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(cat)}
                    className="gap-1.5"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${colors.bgColor}`} />
                    {getCategoryLabel(cat)}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
            {/* Sidebar with Calendar and Filters */}
            <div className="space-y-6">
              {/* Mini Calendar - only show in month view */}
              {viewMode === "month" && (
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <Button variant="ghost" size="icon" onClick={() => handleMonthChange("prev")}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold">{format(currentMonth, "MMMM yyyy", { locale: dateLocale })}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleMonthChange("next")}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      locale={dateLocale}
                      className="pointer-events-auto"
                      modifiers={{
                        hasEvent: eventDates,
                      }}
                      modifiersClassNames={{
                        hasEvent: "bg-primary/20 font-bold",
                      }}
                    />
                    {selectedDate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => setSelectedDate(undefined)}
                      >
                        {t.calendar.showAllMonth}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ICS Export */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  if (!filteredEvents.length) {
                    toast.error('Keine Termine zum Exportieren');
                    return;
                  }
                  downloadIcs(filteredEvents, `msc-kalender-${new Date().toISOString().slice(0, 10)}.ics`);
                  toast.success(`${filteredEvents.length} Termin(e) exportiert`);
                }}
              >
                <Download className="h-4 w-4" />
                {t.calendar.exportCalendar}
              </Button>
            </div>

            {/* Events List */}
            <div className={viewMode === "upcoming" ? "lg:col-span-2" : ""}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {viewMode === "upcoming"
                    ? t.calendar.upcomingAll
                    : selectedDate
                      ? format(selectedDate, fullDateFormat, { locale: dateLocale })
                      : format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
                </h2>
                <span className="text-muted-foreground">
                  {filteredEvents.length} {filteredEvents.length !== 1 ? t.calendar.eventCountPlural : t.calendar.eventCount}
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="flex gap-4 p-0">
                        <Skeleton className="w-24 h-32" />
                        <div className="flex-1 py-4 pr-4">
                          <Skeleton className="h-5 w-24 mb-2" />
                          <Skeleton className="h-6 w-full mb-2" />
                          <Skeleton className="h-12 w-full mb-3" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => {
                    const colors = getCategoryColors(event.category);
                    const categoryLabel = getCategoryLabel(event.category || 'all');
                    const eventDate = new Date(event.start_dt);
                    const eventEndDate = event.end_dt ? new Date(event.end_dt) : null;
                    
                    const clickTarget = getCalendarEventClickTarget(event);
                    
                    return (
                      <Card
                        key={event.id}
                        className={`overflow-hidden transition-shadow hover:shadow-lg ${
                          event.is_main_event ? "border-2 border-accent" : ""
                        } ${clickTarget ? "cursor-pointer" : ""}`}
                        onClick={clickTarget ? () => {
                          if (clickTarget.startsWith('http')) {
                            window.open(clickTarget, '_blank');
                          } else {
                            navigate(clickTarget);
                          }
                        } : undefined}
                      >
                        <CardContent className="flex gap-4 p-0">
                          {/* Date sidebar */}
                          <div
                            className={`flex w-24 shrink-0 flex-col items-center justify-center p-4 ${colors.bgColor} ${colors.color}`}
                          >
                            {eventEndDate && !isSameDay(eventDate, eventEndDate) ? (
                              <>
                                <span className="text-3xl font-black leading-none">{eventDate.getDate()}</span>
                                <span className="text-xs font-bold opacity-70">{t.calendar.until}</span>
                                <span className="text-3xl font-black leading-none">{eventEndDate.getDate()}</span>
                                <span className="mt-1 text-sm font-medium uppercase">
                                  {isSameMonth(eventDate, eventEndDate)
                                    ? format(eventDate, monthLabelFormat, { locale: dateLocale })
                                    : `${format(eventDate, monthLabelFormat, { locale: dateLocale })} – ${format(eventEndDate, monthLabelFormat, { locale: dateLocale })}`}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-3xl font-black">{eventDate.getDate()}</span>
                                <span className="text-sm font-medium uppercase">
                                  {format(eventDate, monthLabelFormat, { locale: dateLocale })}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 py-4 pr-4">
                            <div className="mb-1 flex items-center gap-2 flex-wrap">
                              <span
                                className={`rounded px-2 py-0.5 text-xs font-semibold ${colors.bgColor} ${colors.color}`}
                              >
                                {categoryLabel}
                              </span>
                              {event.is_main_event && (
                                <span className="flex items-center gap-1 rounded bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                                  <Star className="h-3 w-3" />
                                  {t.calendar.mainEvent}
                                </span>
                              )}
                            </div>

                            <h3 className="mb-2 text-lg font-bold">{event.title}</h3>

                            {event.description && (
                              <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(eventDate, timeFormat, { locale: dateLocale })}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {filteredEvents.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-border py-12 text-center text-muted-foreground">
                      <CalendarX className="h-12 w-12 mx-auto mb-4" />
                      <p>{t.calendar.noEvents}</p>
                      <p className="mt-1 text-sm">{t.calendar.noEventsHint}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

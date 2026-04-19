import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Calendar, Flag, CalendarX } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useLanguage } from '@/i18n/LanguageContext';
import { format, isAfter, startOfDay } from 'date-fns';
import { getCalendarEventClickTarget } from '@/lib/calendar-event-links';
import { getDateFnsLocale, localize } from '@/i18n/locale-utils';

export function UpcomingEventsSection() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const dateLocale = getDateFnsLocale(locale);
  const navigate = useNavigate();
  const { data: events, isLoading } = useCalendarEvents();
  const sectionContent = useContentWithFallback('home', 'upcoming_events', {
    title: t.calendar.upcoming,
    subtitle: localize(locale, {
      de: 'Die nächsten Termine im Überblick',
      cz: 'Prehled nejblizsich terminu',
      en: 'Overview of upcoming dates',
      pl: 'Przeglad najblizszych terminow',
    }),
  });
  
  const today = startOfDay(new Date());
  
  // Get upcoming published events, sorted by date, limit to 3
  const upcomingEvents = (events || [])
    .filter(event => {
      const eventDate = new Date(event.start_dt);
      return event.published !== false && isAfter(eventDate, today);
    })
    .sort((a, b) => new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime())
    .slice(0, 3);

  const getCategoryLabel = (category: string | null) => {
    const key = category as keyof typeof t.calendar.filter;
    return t.calendar.filter[key] || category || 'Termin';
  };

  const formatEventDate = (startDt: string, endDt?: string | null) => {
    const start = new Date(startDt);
    const end = endDt ? new Date(endDt) : null;

    if (!end) {
      return format(start, 'd. MMMM yyyy', { locale: dateLocale });
    }

    return `${format(start, 'd. MMMM yyyy', { locale: dateLocale })} - ${format(end, 'd. MMMM yyyy', { locale: dateLocale })}`;
  };

  const gridOverlay = (
    <div className="absolute inset-0 opacity-[0.02]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );

  if (isLoading) {
    return (
      <section className="relative bg-muted/50 py-20 md:py-28">
        {gridOverlay}
        <div className="container relative">
          <div className="mb-12">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden rounded-none border-2">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-24 mb-4" />
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="h-6 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <section className="relative bg-muted/50 py-20 md:py-28">
        {gridOverlay}
        <div className="container relative">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
                {sectionContent.title}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {sectionContent.subtitle}
              </p>
            </div>
            <Button 
              variant="outline" 
              className="group rounded-none font-semibold uppercase tracking-wider"
              asChild
            >
              <Link to="/calendar">
                {t.nav.calendar}
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          <Card className="border-dashed border-2 bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Keine kommenden Termine</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-muted/50 py-20 md:py-28">
      {gridOverlay}

      <div className="container relative">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
              {sectionContent.title}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {sectionContent.subtitle}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="group rounded-none font-semibold uppercase tracking-wider"
            asChild
          >
            <Link to="/calendar">
              {t.nav.calendar}
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {upcomingEvents.map((event) => {
            const isMainEvent = event.is_main_event;
            const clickTarget = getCalendarEventClickTarget(event);
            
            return (
              <Card 
                key={event.id} 
                className={`group relative overflow-hidden rounded-none border-2 transition-all hover:shadow-xl ${
                  isMainEvent 
                    ? 'border-accent bg-gradient-to-br from-accent/5 to-transparent hover:border-accent' 
                    : 'border-border hover:border-primary'
                } ${clickTarget ? 'cursor-pointer' : ''}`}
                onClick={clickTarget ? () => {
                  if (clickTarget.startsWith('http')) {
                    window.open(clickTarget, '_blank');
                  } else {
                    navigate(clickTarget);
                  }
                } : undefined}
              >
                {/* Highlight badge for main event */}
                {isMainEvent && (
                  <div className="absolute right-0 top-0 flex items-center gap-1 bg-accent px-3 py-1 text-xs font-bold uppercase text-accent-foreground">
                    <Flag className="h-3 w-3" />
                    {t.calendar.mainEvent}
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className={`rounded-none px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      isMainEvent 
                        ? 'bg-accent text-accent-foreground' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      {getCategoryLabel(event.category)}
                    </span>
                  </div>
                  
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatEventDate(event.start_dt, event.end_dt)}
                  </div>
                  
                  <h3 className={`text-xl font-bold transition-colors ${
                    isMainEvent 
                      ? 'text-foreground group-hover:text-accent' 
                      : 'text-foreground group-hover:text-primary'
                  }`}>
                    {event.title}
                  </h3>
                </CardContent>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full ${
                  isMainEvent ? 'bg-accent' : 'bg-primary'
                }`} />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

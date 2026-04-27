import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RichContent } from '@/components/content/RichContent';
import { useCalendarEventBySlug } from '@/hooks/useCalendarEvents';
import { useEventContent } from '@/hooks/useEventContent';
import { useLanguage, useTranslation } from '@/i18n/LanguageContext';
import { format } from 'date-fns';
import { getCalendarEventDetailPath, hasCalendarEventTime } from '@/lib/calendar-event-links';
import { getDateFnsLocale, isEnglishLocale, localize } from '@/i18n/locale-utils';
import {
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  ChevronLeft,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

function formatEventDateRange(startDt: string, endDt: string | null, locale: Locale) {
  const dateLocale = getDateFnsLocale(locale);
  const start = new Date(startDt);
  const end = endDt ? new Date(endDt) : null;

  if (!end) {
    return format(start, 'd. MMMM yyyy', { locale: dateLocale });
  }

  return `${format(start, 'd. MMMM yyyy', { locale: dateLocale })} - ${format(end, 'd. MMMM yyyy', { locale: dateLocale })}`;
}

type Locale = 'de' | 'en' | 'cz' | 'pl';

export default function CalendarDetailPage() {
  const { slug = '' } = useParams();
  const { locale } = useLanguage();
  const t = useTranslation();
  const { data: event, isLoading } = useCalendarEventBySlug(slug);
  const { data: eventContent } = useEventContent(event?.id);

  const detailContent = eventContent?.infos?.find((item) => item.section === 'detail_content');
  const infoBlocks = eventContent?.infos?.filter((item) => item.section !== 'detail_content') || [];

  if (isLoading) {
    return (
      <MainLayout
        noindex
        title={localize(locale as Locale, { de: 'Termin lädt', cz: 'Termin se nacita', en: 'Loading event', pl: 'Ladowanie terminu' })}
      >
        <section className="py-16">
          <div className="container space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </section>
      </MainLayout>
    );
  }

  if (!event || event.published === false) {
    return (
      <MainLayout
        noindex
        title={localize(locale as Locale, { de: 'Termin nicht gefunden', cz: 'Termin nebyl nalezen.', en: 'Event not found', pl: 'Nie znaleziono terminu.' })}
      >
        <section className="py-16">
          <div className="container">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {localize(locale as Locale, { de: 'Termin nicht gefunden.', cz: 'Termin nebyl nalezen.', en: 'Event not found.', pl: 'Nie znaleziono terminu.' })}
              </CardContent>
            </Card>
          </div>
        </section>
      </MainLayout>
    );
  }

  const internalDetailPath = getCalendarEventDetailPath(event.slug);
  if (!event.is_main_event && event.detail_url !== internalDetailPath) {
    return (
      <MainLayout
        noindex
        title={localize(locale as Locale, { de: 'Termin-Unterseite nicht aktiviert', cz: 'Podstranka terminu neni aktivovana', en: 'Event subpage not enabled', pl: 'Podstrona wydarzenia nie jest aktywna' })}
      >
        <section className="py-16">
          <div className="container">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {localize(locale as Locale, { de: 'Termin-Unterseite nicht aktiviert.', cz: 'Podstranka terminu neni aktivovana.', en: 'Event subpage not enabled.', pl: 'Podstrona wydarzenia nie jest aktywna.' })}
              </CardContent>
            </Card>
          </div>
        </section>
      </MainLayout>
    );
  }

  const formattedDate = formatEventDateRange(event.start_dt, event.end_dt, locale as Locale);
  const categoryLabel = event.category
    ? t.calendar.filter[event.category as keyof typeof t.calendar.filter] || event.category
    : null;
  const eventStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || detailContent?.content || undefined,
    startDate: event.start_dt,
    endDate: event.end_dt || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: event.location ? {
      '@type': 'Place',
      name: event.location,
      address: event.location,
    } : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'MSC Oberlausitzer Dreiländereck e.V.',
      url: 'https://www.msc-oberlausitz.de',
    },
    url: `https://www.msc-oberlausitz.de${internalDetailPath}`,
  };

  return (
    <MainLayout
      title={event.title}
      description={event.description || undefined}
      canonicalPath={internalDetailPath}
      structuredData={eventStructuredData}
    >
      <PageHeader
        title={detailContent?.title || event.title}
        subtitle={formattedDate}
      />

      <section className="py-10">
        <div className="container">
          <Button variant="outline" asChild>
            <Link to="/calendar">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {localize(locale as Locale, { de: 'Zurück zum Kalender', cz: 'Zpet do kalendare', en: 'Back to calendar', pl: 'Powrot do kalendarza' })}
            </Link>
          </Button>
        </div>
      </section>

      <section className="pb-16">
        <div className="container grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {event.description ? (
              <Card>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{event.description}</p>
                </CardContent>
              </Card>
            ) : null}

            {detailContent?.content ? (
              <Card>
                <CardContent className="p-6">
                  <RichContent content={detailContent.content} className="text-muted-foreground" />
                </CardContent>
              </Card>
            ) : null}

            {infoBlocks.length > 0 ? (
              <div className="grid gap-6">
                {infoBlocks.map((block) => (
                  <Card key={block.id}>
                    <CardHeader>
                      <CardTitle>{block.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RichContent content={block.content || ''} className="text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}

            {eventContent?.schedules?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>{localize(locale as Locale, { de: 'Zeitplan', cz: 'Harmonogram', en: 'Schedule', pl: 'Harmonogram' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {eventContent.schedules.map((day) => (
                    <div key={day.id} className="space-y-3">
                      <h3 className="font-semibold">{day.day_label}</h3>
                      <div className="space-y-2">
                        {day.entries.map((entry) => (
                          <div key={entry.id} className="flex gap-4 border-b border-border pb-2 last:border-0">
                            <span className="w-24 shrink-0 text-sm font-medium text-primary">{entry.time}</span>
                            <span className="text-sm text-muted-foreground">{entry.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{localize(locale as Locale, { de: 'Termininfos', cz: 'Informace o terminu', en: 'Event info', pl: 'Informacje o terminie' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{formattedDate}</span>
                </div>
                {hasCalendarEventTime(event.start_dt) ? (
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{format(new Date(event.start_dt), isEnglishLocale(locale as Locale) ? 'h:mm a' : 'HH:mm', { locale: getDateFnsLocale(locale as Locale) })}</span>
                  </div>
                ) : null}
                {event.location ? (
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{event.location}</span>
                  </div>
                ) : null}
                {event.contact_email ? (
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <a
                      href={`mailto:${event.contact_email}`}
                      onClick={() => trackEvent('contact_click', { category: 'engagement', label: `calendar_detail:${event.slug}` })}
                      className="hover:text-primary"
                    >
                      {event.contact_email}
                    </a>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              {event.registration_url ? (
                <Button asChild>
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('event_registration_click', { category: 'conversion', label: `calendar_detail:${event.slug}` })}
                  >
                    {localize(locale as Locale, { de: 'Zur Anmeldung', cz: 'K registraci', en: 'Register', pl: 'Do rejestracji' })}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : null}
              {categoryLabel ? (
                <Badge variant="outline" className="w-fit">
                  {categoryLabel}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

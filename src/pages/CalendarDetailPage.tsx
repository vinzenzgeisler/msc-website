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
import { useLanguage } from '@/i18n/LanguageContext';
import { format } from 'date-fns';
import { de, cs, enUS } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  ChevronLeft,
} from 'lucide-react';

function formatEventDateRange(startDt: string, endDt: string | null, locale: Locale) {
  const dateLocale = locale === 'cz' ? cs : locale === 'en' ? enUS : de;
  const start = new Date(startDt);
  const end = endDt ? new Date(endDt) : null;

  if (!end) {
    return format(start, 'd. MMMM yyyy', { locale: dateLocale });
  }

  return `${format(start, 'd. MMMM yyyy', { locale: dateLocale })} - ${format(end, 'd. MMMM yyyy', { locale: dateLocale })}`;
}

type Locale = 'de' | 'en' | 'cz';

export default function CalendarDetailPage() {
  const { slug = '' } = useParams();
  const { locale } = useLanguage();
  const { data: event, isLoading } = useCalendarEventBySlug(slug);
  const { data: eventContent } = useEventContent(event?.id);

  const detailContent = eventContent?.infos?.find((item) => item.section === 'detail_content');
  const infoBlocks = eventContent?.infos?.filter((item) => item.section !== 'detail_content') || [];

  if (isLoading) {
    return (
      <MainLayout>
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
      <MainLayout>
        <section className="py-16">
          <div className="container">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Termin nicht gefunden.
              </CardContent>
            </Card>
          </div>
        </section>
      </MainLayout>
    );
  }

  const formattedDate = formatEventDateRange(event.start_dt, event.end_dt, locale as Locale);

  return (
    <MainLayout title={event.title} description={event.description || undefined}>
      <PageHeader
        title={detailContent?.title || event.title}
        subtitle={formattedDate}
      />

      <section className="py-10">
        <div className="container">
          <Button variant="outline" asChild>
            <Link to="/calendar">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Zurück zum Kalender
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
                  <CardTitle>Zeitplan</CardTitle>
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
                <CardTitle>Termininfos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{formattedDate}</span>
                </div>
                {event.start_dt ? (
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{format(new Date(event.start_dt), locale === 'en' ? 'h:mm a' : 'HH:mm', { locale: locale === 'cz' ? cs : locale === 'en' ? enUS : de })}</span>
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
                    <a href={`mailto:${event.contact_email}`} className="hover:text-primary">
                      {event.contact_email}
                    </a>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              {event.registration_url ? (
                <Button asChild>
                  <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                    Zur Anmeldung
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : null}
              {event.category ? (
                <Badge variant="outline" className="w-fit">
                  {event.category}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

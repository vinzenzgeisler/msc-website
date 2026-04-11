import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Bike, Target, Users, Award, Mail, ArrowRight } from 'lucide-react';
import { useContentWithFallback, PageKey } from '@/hooks/usePageContent';
import { useDisciplineHighlights } from '@/hooks/useStructuredContent';
import type { DisciplineHighlight } from '@/integrations/pocketbase/client';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSettings } from '@/hooks/useSettings';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  training: MapPin,
  events: Calendar,
  award: Award,
  track: Bike,
  community: Users,
  tour: MapPin,
  target: Target,
  trophy: Trophy,
};

interface DisciplinePageProps {
  pageKey: PageKey;
  categoryFilter: DisciplineHighlight['discipline_key'];
  fallbackTitle: string;
  defaultIcon: LucideIcon;
  fallbackHighlights: Array<{ id: string; title: string; description: string; icon: string }>;
}

export default function DisciplinePage({
  pageKey,
  categoryFilter,
  fallbackTitle,
  defaultIcon: DefaultIcon,
  fallbackHighlights,
}: DisciplinePageProps) {
  const intro = useContentWithFallback(pageKey, 'intro', { title: fallbackTitle, subtitle: '', content: '' });
  const training = useContentWithFallback(pageKey, 'training', { title: 'Training', content: '' });
  const eventsContent = useContentWithFallback(pageKey, 'events', { title: 'Veranstaltungen', content: '' });
  const { data: highlights, isLoading } = useDisciplineHighlights(categoryFilter);
  const { data: calendarEvents } = useCalendarEvents(false);
  const { data: settings } = useSettings();

  const upcomingEvents = (calendarEvents || [])
    .filter((e) => e.category === categoryFilter && e.published && new Date(e.start_dt) >= new Date())
    .slice(0, 3);

  return (
    <MainLayout>
      {/* Hero with optional image */}
      <section className="relative bg-primary py-16 text-primary-foreground">
        {intro.image_url && (
          <div className="absolute inset-0">
            <img src={intro.image_url} alt={intro.image_alt || intro.title} className="h-full w-full object-cover opacity-20" />
          </div>
        )}
        <div className="container relative">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-48 mb-2 bg-primary-foreground/10" />
              <Skeleton className="h-6 w-72 bg-primary-foreground/10" />
            </>
          ) : (
            <>
              <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
                {intro.title || fallbackTitle}
              </h1>
              {intro.subtitle && (
                <p className="text-lg text-primary-foreground/80">{intro.subtitle}</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Intro Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            {isLoading ? (
              <Skeleton className="h-24 w-full mb-8" />
            ) : intro.content ? (
              <div
                className="mb-8 text-lg text-muted-foreground prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }}
              />
            ) : null}

            {/* Highlight Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              {(highlights && highlights.length > 0 ? highlights : fallbackHighlights).map((item) => {
                const Icon = iconMap[item.icon] || DefaultIcon;
                return (
                  <Card key={item.id}>
                    <CardContent className="p-6 text-center">
                      <Icon className="mx-auto mb-3 h-10 w-10 text-primary" />
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Training Section */}
      {training.content && (
        <section className="bg-muted/30 py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-2xl font-bold">{training.title}</h2>
              <div
                className="prose dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: training.content.replace(/\n/g, '<br />') }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Events / Upcoming from Calendar */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">
              {eventsContent.title || 'Kommende Termine'}
            </h2>
            {eventsContent.content && (
              <div
                className="mb-6 prose dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: eventsContent.content.replace(/\n/g, '<br />') }}
              />
            )}

            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="flex items-center gap-4 p-5">
                      <Calendar className="h-8 w-8 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.start_dt), 'dd. MMMM yyyy', { locale: de })}
                          {event.location && ` · ${event.location}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Derzeit keine anstehenden Termine.</p>
            )}

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button asChild>
                <Link to={`/calendar`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Alle Termine ansehen
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href={`mailto:${settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Kontakt aufnehmen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

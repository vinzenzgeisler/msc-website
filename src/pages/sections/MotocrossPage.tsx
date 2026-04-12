import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Euro,
  ShieldAlert,
  Bike,
  Users,
  Mail,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Ticket,
} from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useDisciplineHighlights } from '@/hooks/useStructuredContent';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/i18n/LanguageContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import trackImageFallback from '@/assets/motocross-track.jpg';
import anfahrtImageFallback from '@/assets/motocross-anfahrt.jpg';

export default function MotocrossPage() {
  const t = useTranslation();
  const { data: settings } = useSettings();
  const { data: highlights, isLoading: highlightsLoading } = useDisciplineHighlights('motocross');
  const { data: calendarEvents } = useCalendarEvents(false);

  const intro = useContentWithFallback('motocross', 'intro', {
    title: 'Motocross',
    subtitle: 'MX-Trainingsstrecke Hainewalde',
    content:
      'Die Motocross-Strecke wurde mit viel Aufwand völlig neu gestaltet. Wir stellen unseren Motorsportlern hier ein ordentliches Übungsgelände zur Verfügung. Auf unserer neu gestalteten und gut präparierten MX-Strecke ist jetzt wieder mächtig was los – ein ideales Test- und Übungsgelände für Motorsportler.',
  });

  const training = useContentWithFallback('motocross', 'training', {
    title: 'Öffnungszeiten',
    content: `<table>
<tr><td><strong>Mittwoch</strong></td><td>17:00 – 19:00 Uhr</td></tr>
<tr><td><strong>Samstag</strong></td><td>10:00 – 12:00 Uhr und 13:00 – 15:00 Uhr</td></tr>
</table>`,
    subtitle: 'Wichtig: Motocrossstrecke vom 01.11. bis 31.03. geschlossen (Winterpause)',
  });

  const fees = useContentWithFallback('motocross', 'fees', {
    title: 'Gebühren für die Nutzung der Strecke',
    content: `<table>
<tr><td>Motorräder bis 85 ccm</td><td><strong>10,00 €</strong> pro Trainingstag</td></tr>
<tr><td>Motorräder über 100 ccm</td><td><strong>15,00 €</strong> pro Trainingstag</td></tr>
<tr><td>ATV / Quads</td><td><strong>20,00 €</strong> pro Trainingstag</td></tr>
<tr><td>UTV / Side by Side</td><td><strong>25,00 €</strong> pro Trainingstag (nur nach Voranmeldung)</td></tr>
</table>`,
    subtitle:
      'Für Vielfahrer bieten wir eine 10-Tageskarte an: Du zahlst 10 Trainingstage und bekommst einen Bonus-Tag kostenlos dazu. Mitglieder des MSC Oberlausitzer Dreiländereck können die Trainingsstrecke kostenlos nutzen.',
  });

  const safety = useContentWithFallback('motocross', 'safety', {
    title: 'Sicherheitshinweise',
    content:
      'Bitte beachtet die Sicherheitshinweise auf dem Streckengelände. Schutzausrüstung ist Pflicht! Weitere Informationen findet ihr in unseren Sicherheitshinweisen.',
  });

  const directions = useContentWithFallback('motocross', 'directions', {
    title: 'Anfahrt zur MX-Strecke',
    subtitle: 'Hainewalde',
    content:
      'Unsere Motocross-Trainingsstrecke befindet sich in Hainewalde. Weitere Infos könnt ihr auch auf unserer Facebook-Seite bekommen.',
  });

  const eventsContent = useContentWithFallback('motocross', 'events', {
    title: 'Kommende Termine',
    content: '',
  });

  const trackImage = intro.image_url || trackImageFallback;
  const directionsImage = directions.image_url || anfahrtImageFallback;

  const upcomingEvents = (calendarEvents || [])
    .filter((e) => e.category === 'motocross' && e.published && new Date(e.start_dt) >= new Date())
    .slice(0, 3);

  return (
    <MainLayout>
      <PageHeader title={intro.title || 'Motocross'} subtitle={intro.subtitle} />

      {/* Intro + Track Image */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              {intro.content && (
                <div
                  className="text-lg text-muted-foreground prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }}
                />
              )}

              {/* Highlight Cards */}
              {highlights && highlights.length > 0 && (
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <Card key={item.id} className="text-center">
                      <CardContent className="p-4">
                        <Bike className="mx-auto mb-2 h-6 w-6 text-primary" />
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            <div>
              <img
                src={intro.image_url ? intro.image_url : trackImage}
                alt="Motocross-Strecke Luftbild"
                className="w-full border border-border object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Opening Hours + Fees */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Opening Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {training.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {training.subtitle && (
                  <Badge variant="destructive" className="mb-4 gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {training.subtitle}
                  </Badge>
                )}
                {training.content && (
                  <div
                    className="prose dark:prose-invert max-w-none [&_table]:w-full [&_td]:py-2 [&_td]:pr-4 [&_td:first-child]:font-semibold [&_td:first-child]:text-foreground [&_td:last-child]:text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: training.content }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Fees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5 text-primary" />
                  {fees.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fees.content && (
                  <div
                    className="prose dark:prose-invert max-w-none mb-4 [&_table]:w-full [&_td]:py-2 [&_td]:pr-4 [&_td:first-child]:text-foreground [&_td:last-child]:font-semibold [&_td:last-child]:text-primary"
                    dangerouslySetInnerHTML={{ __html: fees.content }}
                  />
                )}
                {fees.subtitle && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
                      <span>{fees.subtitle}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="border-t border-border py-12">
        <div className="container">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-destructive/10">
                <ShieldAlert className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h2 className="mb-2 text-lg font-bold">{safety.title}</h2>
                {safety.content && (
                  <div
                    className="prose dark:prose-invert max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: safety.content.replace(/\n/g, '<br />') }}
                  />
                )}
                {safety.primary_button_url && (
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <a
                      href={safety.primary_button_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {safety.primary_button_label || 'Sicherheitshinweise lesen'}
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Directions */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-8 text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            {directions.title}
          </h2>
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              {directions.subtitle && (
                <Badge className="mb-4 bg-primary">{directions.subtitle}</Badge>
              )}
              {directions.content && (
                <div
                  className="prose dark:prose-invert max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: directions.content.replace(/\n/g, '<br />'),
                  }}
                />
              )}
              {directions.primary_button_url && (
                <Button className="mt-4" asChild>
                  <a
                    href={directions.primary_button_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {directions.primary_button_label || 'In Google Maps öffnen'}
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
              {settings?.facebook_url && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Weitere Infos auf{' '}
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Facebook
                  </a>
                </p>
              )}
            </div>
            <div>
              <img
                src={directions.image_url || anfahrtImage}
                alt={directions.image_alt || 'Anfahrt zur Motocross-Strecke'}
                className="w-full border border-border object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="border-t border-border py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">{eventsContent.title || 'Kommende Termine'}</h2>
            {eventsContent.content && (
              <div
                className="mb-6 prose dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: eventsContent.content.replace(/\n/g, '<br />'),
                }}
              />
            )}
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
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
                <Link to="/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Alle Termine ansehen
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`mailto:${settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}`}
                >
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

import { useState } from 'react';
import { ImageGallerySection } from '@/components/sections/ImageGallerySection';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { DisciplineEventCard } from '@/components/sections/DisciplineEventCard';
import {
  Calendar,
  MapPin,
  Clock,
  Euro,
  ShieldAlert,
  Bike,
  Users,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Ticket,
  CalendarX,
} from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useDisciplineHighlights } from '@/hooks/useStructuredContent';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/i18n/LanguageContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { RichContent } from '@/components/content/RichContent';
import { isStructuredRowsContent, parseStructuredRows, rowsToHtmlTable } from '@/lib/structured-rows';

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
    content: `<ol>
<li>Niemals auf der Bahn laufen.</li>
<li>Zu- und Abfahrt nur über die offiziellen Ein- und Ausfahrten. Es darf nicht abgekürzt werden.</li>
<li>Es darf nur in der vorgeschriebenen Fahrtrichtung gefahren werden.</li>
<li>Beim Stürzen oder Ausfall der Technik gilt:<br/>– Auf kürzestem Wege seitlich die MX-Strecke <u>sofort</u> verlassen.<br/>– Niemals den Sprunghügel gegen die Fahrtrichtung auf der MX-Strecke hochlaufen, sondern den vorhandenen Grünstreifen neben der Strecke dafür nutzen, z.B. am großen Sprunghügel in Fahrtrichtung links am Zaun.<br/>– Dafür sorgen, dass die nachfolgenden Fahrer gewarnt werden. Erst dann wird das Motorrad/Fahrzeug geborgen.</li>
<li>Das Betreten der MX-Strecke durch eine Begleitperson, außer bei notwendigen Hilfeleistungen, ist untersagt. Vor Betreten der Strecke durch Hilfskräfte muss das Training abgebrochen sein.</li>
<li>Kinder müssen von ihren Eltern bzw. Begleitpersonen mit diesen Regeln vertraut gemacht werden.</li>
<li>Schnellere Fahrer nehmen <strong>Rücksicht</strong> auf langsamere Fahrer. <strong>Training ist kein Rennen</strong>, sondern eine Erprobungs- und Übungsfahrt.</li>
<li>Langsame Fahrer halten ihre Spur, lassen den schnelleren überholen und wechseln nicht plötzlich die Spur.</li>
<li>Die erste Runde bei jeder Trainingseinheit ist grundsätzlich eine Besichtigungsrunde und dient dazu sich mit der Bahn vertraut zu machen.</li>
<li>Erkennt eure Grenzen und handelt eurer Gesundheit zu Liebe eigenverantwortlich und vernünftig. Wer noch nie gesprungen ist, muss auch nicht sofort jeden Table schaffen. Wer bereits Fahrerfahrung hat bezieht auch andere Faktoren wie Wind und Bodenunebenheiten in seine Überlegungen ein. Verbessert euch immer von einem stabilen Level aus weiter. Als Fahranfänger beschäftigt euch mit der Fahrtechnik.</li>
</ol>`,
    subtitle: 'Gefährdet mit eurem Verhalten nicht die Gesundheit von euch oder die der anderen Teilnehmer.',
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

  const [safetyOpen, setSafetyOpen] = useState(false);
  const trackImage = intro.image_url || trackImageFallback;
  const directionsImage = directions.image_url || anfahrtImageFallback;

  const trainingContentHtml = isStructuredRowsContent(training.content)
    ? rowsToHtmlTable(parseStructuredRows(training.content))
    : training.content;
  const feesContentHtml = isStructuredRowsContent(fees.content)
    ? rowsToHtmlTable(parseStructuredRows(fees.content))
    : fees.content;

  const upcomingEvents = (calendarEvents || [])
    .filter((e) => e.category === 'motocross' && e.published && new Date(e.start_dt) >= new Date())
    .slice(0, 3);

  return (
    <MainLayout>
      <PageHeader
        title={intro.title || 'Motocross'}
        subtitle={intro.subtitle}
        imageUrl={intro.header_image_url || undefined}
        imageAlt={intro.header_image_alt || intro.title || 'Motocross'}
      />

      {/* Intro + Track Image */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-0 lg:grid-cols-2">
            {/* Text side */}
            <div className="relative bg-primary p-8 md:p-12 flex flex-col justify-center">
              {/* Racing stripe accent */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
              

              {intro.content && (
                <RichContent
                  content={intro.content}
                  className="text-lg text-primary-foreground/90 prose-invert [&_strong]:text-accent"
                />
              )}

              {/* Stats row from CMS */}
              {(intro.stat_one_label || intro.stat_two_label || intro.stat_three_label) && (
                <div className="mt-8 flex gap-6 border-t border-primary-foreground/20 pt-6">
                  {[intro.stat_one_label, intro.stat_two_label, intro.stat_three_label]
                    .filter(Boolean)
                    .map((stat, i) => (
                      <div key={i} className="text-sm font-semibold text-accent uppercase tracking-wide">
                        {stat}
                      </div>
                    ))}
                </div>
              )}

              {/* Highlight Cards */}
              {highlights && highlights.length > 0 && (
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.id} className="border border-primary-foreground/20 p-3 text-center">
                      <Bike className="mx-auto mb-1.5 h-5 w-5 text-accent" />
                      <h3 className="text-xs font-bold text-primary-foreground uppercase tracking-wide">{item.title}</h3>
                      <p className="mt-1 text-xs text-primary-foreground/60">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image side */}
            <div className="relative min-h-[300px] lg:min-h-[400px]">
              <img
                src={trackImage}
                alt={intro.image_alt || 'Motocross-Strecke Luftbild'}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              {/* Diagonal overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
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
                  <RichContent
                    content={training.content}
                    className="[&_table]:w-full [&_td]:py-2 [&_td]:pr-4 [&_td:first-child]:font-semibold [&_td:first-child]:text-foreground [&_td:last-child]:text-muted-foreground"
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
                  <RichContent
                    content={fees.content}
                    className="mb-4 [&_table]:w-full [&_td]:py-2 [&_td]:pr-4 [&_td:first-child]:text-foreground [&_td:last-child]:font-semibold [&_td:last-child]:text-primary"
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
          <Card className="border-destructive/20 bg-destructive/5">
            <button
              onClick={() => setSafetyOpen(!safetyOpen)}
              className="flex w-full items-center gap-4 p-5 text-left group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-destructive/10">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold group-hover:text-primary transition-colors">
                  {safety.title}
                </h2>
                {safety.subtitle && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{safety.subtitle}</p>
                )}
              </div>
              <ArrowRight
                className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${safetyOpen ? 'rotate-90' : ''}`}
              />
            </button>

            {safetyOpen && (
              <CardContent className="border-t border-destructive/10 px-5 pb-5 pt-4">
                {safety.content && (
                  <RichContent
                    content={safety.content}
                    className="text-sm text-muted-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-3"
                  />
                )}
              </CardContent>
            )}
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
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            <div>
              {directions.subtitle && (
                <Badge className="mb-4 bg-primary">{directions.subtitle}</Badge>
              )}
              {directions.content && (
                <RichContent content={directions.content} className="text-muted-foreground" />
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <a
                    href={directions.primary_button_url || 'https://maps.app.goo.gl/LCvqmstWcBnnypcg7'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {directions.primary_button_label || 'In Google Maps öffnen'}
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </a>
                </Button>
                {settings?.facebook_url && (
                  <Button variant="outline" asChild>
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Facebook
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <div className="overflow-hidden border border-border">
              <iframe
                style={{ width: '100%', height: '350px', border: 0 }}
                allowFullScreen
                loading="lazy"
                src={directions.secondary_button_url || 'https://umap.openstreetmap.de/de/map/motocross-strecke-msc-oberlausitzer-dreilandereck-_132467?scaleControl=false&miniMap=false&scrollWheelZoom=false&zoomControl=true&editMode=disabled&moreControl=false&searchControl=false&tilelayersControl=false&embedControl=false&datalayersControl=false&onLoadPanel=none&captionBar=false&captionMenus=false&homeControl=false&fullscreenControl=false&captionControl=false'}
                title="Standort MX-Strecke"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <ImageGallerySection
        albumSlug="motocross"
        title="Galerie"
        fallbackText="Noch keine Bilder vorhanden."
      />

      {/* Upcoming Events */}
      <section className="border-t border-border py-16">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {eventsContent.title || 'Kommende Termine'}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-none font-semibold uppercase tracking-wider" asChild>
                <Link to="/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Alle Termine
                </Link>
              </Button>
            </div>
          </div>
          {eventsContent.content && (
            <RichContent content={eventsContent.content} className="mb-6 text-muted-foreground" />
          )}
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {upcomingEvents.map((event) => (
                <DisciplineEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-none border-2 border-dashed border-border bg-card p-12 text-center">
              <CalendarX className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Derzeit keine anstehenden Termine.</p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}

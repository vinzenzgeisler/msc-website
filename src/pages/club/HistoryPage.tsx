import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Clock, Users, Trophy, MapPin } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useHistoryTimelineEntries } from '@/hooks/useStructuredContent';

export default function HistoryPage() {
  const t = useTranslation();

  const intro = useContentWithFallback('history', 'intro', {
    title: 'Vereinsgeschichte',
    subtitle: 'Seit 2013 im Motorsport aktiv',
    content:
      'Am 31.05.2013 wurde der Motorsportclub „MSC Oberlausitzer-Dreiländereck" e.V. in Jonsdorf im Hotel Gondelfahrt gegründet. Der MSC Oberlausitzer-Dreiländereck ist Mitglied im „Deutschen Motorsport Verband" (DMV).',
  });

  const founding = useContentWithFallback('history', 'founding', {
    title: 'Gründung des MSC Oberlausitzer Dreiländereck',
    content: `<p>Zur Eröffnungsveranstaltung waren 30 Mitglieder erschienen. Zur 1. Hauptversammlung am 13.06.2013 waren bereits 75 Mitglieder eingeschrieben. Unter den Mitgliedern finden sich Freunde des Motorsports, aktive und ehemalige Motorsportler wieder.</p>
<p>Dr. Herrmann Funke verlas die umfangreiche Satzung und gab fachkundig Auskunft zu gestellten Fragen. Schwerpunkte sind u.a. die Förderung der Jugendarbeit, Sicherheit für den Straßenverkehr, Pflege des Motorsports, Ausbau motorsportlicher Verbindungen nach CZ und PL und die Organisation von Veranstaltungen. Eine mit erfahrenen Fachleuten besetzte Clubleitung wurde einstimmig gewählt.</p>
<p>Der gemeinnützige Verein legt besonderen Wert auf den Ausbau der Attraktivität und die Erhöhung des Bekanntheitsgrades unserer Region sowie die grenzüberschreitende Zusammenarbeit mit anderen Motorsportvereinen. Außerdem bemühen wir uns um unsere Motorsportjugend.</p>`,
    subtitle: '31. Mai 2013 · Jonsdorf',
  });

  const track = useContentWithFallback('history', 'track', {
    title: 'Das Oberlausitzer Dreieck',
    content:
      'Die Strecke verläuft als „Oberlausitzer Dreieck" mit einer Länge von 5,9 Kilometern zwischen Saalendorf, Jonsdorf und Waltersdorf. Fahrerlager, Parkplätze, Gastronomie, Quartiere – alles passt gut zusammen.',
  });

  const { data: timelineEntries, isLoading } = useHistoryTimelineEntries();

  return (
    <MainLayout>
      <PageHeader
        title={intro.title}
        subtitle={intro.subtitle || 'Vereinsgeschichte'}
        imageUrl={intro.image_url}
        imageAlt={intro.image_alt || intro.title}
      />

      {/* Intro */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="relative bg-primary p-8 md:p-12 flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
              {intro.content && (
                <div
                  className="text-lg text-primary-foreground/90 prose prose-invert max-w-none [&_strong]:text-accent"
                  dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }}
                />
              )}
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
            </div>
            {intro.image_url ? (
              <div className="relative min-h-[300px] lg:min-h-[400px]">
                <img
                  src={intro.image_url}
                  alt={intro.image_alt || 'Vereinsgeschichte'}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
              </div>
            ) : (
              <div className="relative min-h-[300px] lg:min-h-[400px] bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <History className="mx-auto mb-3 h-16 w-16 opacity-30" />
                  <p className="text-sm">Bild im CMS hinterlegen</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Founding Story */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">{founding.title}</h2>
            </div>
            {founding.subtitle && (
              <p className="mb-6 text-sm text-muted-foreground">{founding.subtitle}</p>
            )}
            {founding.content && (
              <div
                className="prose dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: founding.content }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Track Info */}
      <section className="border-t border-border py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">{track.title}</h2>
            </div>
            {track.content && (
              <div
                className="prose dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: track.content.replace(/\n/g, '<br />') }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Meilensteine
            </h2>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : timelineEntries && timelineEntries.length > 0 ? (
              <div className="relative space-y-12 pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/20">
                {timelineEntries.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center border-2 border-primary bg-background">
                      <Clock className="h-3 w-3 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <span className="inline-block bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                        {entry.year_label}
                      </span>
                      <h3 className="text-xl font-bold">{entry.title}</h3>
                      {entry.image_url && (
                        <img
                          src={entry.image_url}
                          alt={entry.title}
                          className="h-48 w-full object-cover"
                          loading="lazy"
                        />
                      )}
                      {entry.description && (
                        <div
                          className="prose dark:prose-invert max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: entry.description.replace(/\n/g, '<br />') }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                  <History className="h-12 w-12" />
                  <p className="text-lg font-medium">Noch keine Meilensteine hinterlegt.</p>
                  <p className="text-sm">Die Chronik kann im Admin-Bereich gepflegt werden.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

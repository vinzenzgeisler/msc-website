import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { History, Users, MapPin } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { RichContent } from '@/components/content/RichContent';

const fallbacks = {
  de: {
    intro: { title: 'Vereinsgeschichte', subtitle: 'Seit 2013 im Motorsport aktiv', content: 'Am 31.05.2013 wurde der Motorsportclub „MSC Oberlausitzer-Dreiländereck" e.V. in Jonsdorf im Hotel Gondelfahrt gegründet. Der MSC Oberlausitzer-Dreiländereck ist Mitglied im „Deutschen Motorsport Verband" (DMV).' },
    founding: { title: 'Gründung des MSC Oberlausitzer Dreiländereck', subtitle: '31. Mai 2013 · Jonsdorf', content: '<p>Zur Eröffnungsveranstaltung waren 30 Mitglieder erschienen. Zur 1. Hauptversammlung am 13.06.2013 waren bereits 75 Mitglieder eingeschrieben.</p><p>Dr. Herrmann Funke verlas die umfangreiche Satzung und gab fachkundig Auskunft zu gestellten Fragen. Schwerpunkte sind u.a. die Förderung der Jugendarbeit, Sicherheit für den Straßenverkehr, Pflege des Motorsports, Ausbau motorsportlicher Verbindungen nach CZ und PL und die Organisation von Veranstaltungen.</p><p>Der gemeinnützige Verein legt besonderen Wert auf den Ausbau der Attraktivität und die Erhöhung des Bekanntheitsgrades unserer Region sowie die grenzüberschreitende Zusammenarbeit mit anderen Motorsportvereinen.</p>' },
    track: { title: 'Das Oberlausitzer Dreieck', content: 'Die Strecke verläuft als „Oberlausitzer Dreieck" mit einer Länge von 5,9 Kilometern zwischen Saalendorf, Jonsdorf und Waltersdorf. Fahrerlager, Parkplätze, Gastronomie, Quartiere – alles passt gut zusammen.' },
  },
  cz: {
    intro: { title: 'Historie klubu', subtitle: 'V motorsportu aktivní od roku 2013', content: 'Dne 31.05.2013 byl v Jonsdorfu v hotelu Gondelfahrt založen motorsportový klub „MSC Oberlausitzer-Dreiländereck" e.V. MSC je členem „Německého motorsportového svazu" (DMV).' },
    founding: { title: 'Založení MSC Oberlausitzer Dreiländereck', subtitle: '31. května 2013 · Jonsdorf', content: '<p>Na zahajovací akci se zúčastnilo 30 členů. Na první valné hromadě dne 13.06.2013 bylo již zapsáno 75 členů.</p><p>Neziskový spolek klade zvláštní důraz na rozvoj atraktivity a zvýšení povědomí o našem regionu a přeshraniční spolupráci s dalšími motorsportovými kluby.</p>' },
    track: { title: 'Horní Lužický trojúhelník', content: 'Trať „Oberlausitzer Dreieck" měří 5,9 kilometrů a vede mezi Saalendorfem, Jonsdorfem a Waltersdorfem.' },
  },
  en: {
    intro: { title: 'Club History', subtitle: 'Active in motorsport since 2013', content: 'On May 31, 2013, the motorsport club "MSC Oberlausitzer-Dreiländereck" e.V. was founded in Jonsdorf at Hotel Gondelfahrt. The MSC is a member of the "German Motorsport Association" (DMV).' },
    founding: { title: 'Founding of MSC Oberlausitzer Dreiländereck', subtitle: 'May 31, 2013 · Jonsdorf', content: '<p>30 members attended the inaugural event. By the first general assembly on June 13, 2013, 75 members had already registered.</p><p>The non-profit association places particular emphasis on enhancing the attractiveness and raising awareness of our region as well as cross-border cooperation with other motorsport clubs.</p>' },
    track: { title: 'The Upper Lusatian Triangle', content: 'The track runs as the "Oberlausitzer Dreieck" with a length of 5.9 kilometers between Saalendorf, Jonsdorf, and Waltersdorf.' },
  },
  pl: {
    intro: { title: 'Historia klubu', subtitle: 'Aktywni w motorsporcie od 2013 roku', content: '31.05.2013 w Jonsdorfie w hotelu Gondelfahrt zalozono klub motorsportowy "MSC Oberlausitzer-Dreilaendereck" e.V. MSC jest czlonkiem "Deutscher Motorsport Verband" (DMV).' },
    founding: { title: 'Zalozenie MSC Oberlausitzer Dreilaendereck', subtitle: '31 maja 2013 · Jonsdorf', content: '<p>W wydarzeniu inauguracyjnym uczestniczylo 30 czlonkow. Na pierwszym walnym zgromadzeniu 13.06.2013 zapisanych bylo juz 75 czlonkow.</p><p>Stowarzyszenie non-profit kladzie szczegolny nacisk na atrakcyjnosc naszego regionu, zwiekszanie jego rozpoznawalnosci oraz wspolprace transgraniczna z innymi klubami motorsportowymi.</p>' },
    track: { title: 'Gornoluzycki Trojkat', content: 'Trasa "Oberlausitzer Dreieck" ma dlugosc 5,9 kilometra i przebiega pomiedzy Saalendorfem, Jonsdorfem i Waltersdorfem.' },
  },
};

export default function HistoryPage() {
  const { locale } = useLanguage();
  const lang = (locale === 'cz' || locale === 'en' || locale === 'pl') ? locale : 'de';
  const fb = fallbacks[lang];

  const intro = useContentWithFallback('history', 'intro', fb.intro);
  const founding = useContentWithFallback('history', 'founding', fb.founding);
  const track = useContentWithFallback('history', 'track', fb.track);

  return (
    <MainLayout title={intro.title} description={intro.subtitle || undefined}>
      <PageHeader
        title={intro.title}
        subtitle={intro.subtitle || 'Vereinsgeschichte'}
        imageUrl={intro.header_image_url || undefined}
        imageAlt={intro.header_image_alt || intro.title}
      />

      <section className="border-t border-border bg-muted/30 py-14 md:py-16">
        <div className="container">
          <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-12">
            <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-sm xl:col-span-5">
              <CardContent className="p-7 md:p-8">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-accent">
                  Seit 2013
                </p>
                <div className="mb-5 flex items-center gap-3">
                  <History className="h-5 w-5 text-accent" />
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    {intro.title}
                  </h2>
                </div>
                {intro.content ? (
                  <RichContent
                    content={intro.content}
                    className="text-left text-primary-foreground/85 prose-invert prose-p:leading-7 [&_strong]:text-accent"
                  />
                ) : (
                  <p className="text-primary-foreground/70">Noch kein Einführungstext hinterlegt.</p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:col-span-7">
              <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
                <CardContent className="p-8">
                  <div className="mb-5 h-1.5 w-14 bg-accent" />
                  <div className="mb-4 flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">{founding.title}</h2>
                  </div>
                  {founding.subtitle ? (
                    <p className="mb-5 text-sm text-muted-foreground">{founding.subtitle}</p>
                  ) : null}
                  {founding.content ? (
                    <RichContent content={founding.content} className="text-muted-foreground prose-p:leading-8" />
                  ) : (
                    <p className="text-muted-foreground">Noch keine Inhalte hinterlegt.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-border/60 bg-card shadow-sm">
                <CardContent className="p-8">
                  <div className="mb-5 h-1.5 w-14 bg-primary" />
                  <div className="mb-4 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">{track.title}</h2>
                  </div>
                  {track.content ? (
                    <RichContent content={track.content} className="text-muted-foreground prose-p:leading-8" />
                  ) : (
                    <p className="text-muted-foreground">Noch keine Inhalte hinterlegt.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

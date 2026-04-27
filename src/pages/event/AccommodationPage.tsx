import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLanguage } from '@/i18n/LanguageContext';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BedDouble, ExternalLink, Phone, Mail, MapPin, ArrowLeft, Globe } from 'lucide-react';
import { localize } from '@/i18n/locale-utils';

interface Accommodation {
  name: string;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
}

const FALLBACK_ACCOMMODATIONS: Accommodation[] = [
  {
    name: 'Gästehaus der Oberlausitzer Dreieck gGmbH',
    description: 'Direkt an am Start- und Ziel des Oberlausitzer Dreiecks in unmittelbarer Nähe zum Fahrerlager 1. Neu eröffnetes Gästehaus mit allem, was man zur Übernachtung an einem Motorsportwochenende braucht. Auch die Verpflegung wird angeboten.',
    address: 'Jägerwäldchen 2, 02763 Bertsdorf-Hörnitz',
    website: 'https://oberlausitzer-dreieck.de/',
  },
  {
    name: 'Trixi-Park Großschönau',
    description: 'Nur wenige Gehminuten von der Strecke und dem Start entfernt.',
    address: 'Jonsdorfer Straße 40, 02779 Großschönau',
    phone: '035841 / 6310',
    email: 'info@trixi-park.de',
    website: 'http://www.trixi-park.de/',
  },
  {
    name: 'Campinghof Sell',
    description: 'Wunderschön und direkt an der Strecke gelegen.',
    address: 'Saalendorf 5, 02799 Großschönau OT Waltersdorf',
    phone: '035841 / 36357',
    email: 'camping@sell-hof.de',
    website: 'http://www.sell-hof.de/',
  },
  {
    name: 'Hotel „Gondelfahrt“',
    description: 'In Jonsdorf, einige Gehminuten von der Strecke entfernt gelegen.',
    address: 'Großschönauer Straße 38, 02796 Jonsdorf',
    phone: '035844 / 7360',
    email: 'info@hotel-gondelfahrt.de',
    website: 'http://www.hotel-gondelfahrt.de/',
  },
  {
    name: 'Hotel „Quirle-Häusl“',
    description: 'In Waltersdorf, unweit der Strecke gelegen und vom beliebten Schlager-Paar Kathrin & Peter geführt.',
    address: 'Hauptstraße 45, 02799 Waltersdorf',
    phone: '035841 / 606060',
    email: 'hotel@quirle.de',
    website: 'http://www.quirle.de/',
  },
  {
    name: 'Pension „Zur Deutschen Eiche“',
    description: 'In Großschönau, unweit der Strecke mit hauseigener Bowlingbahn und Pizzeria.',
    address: 'Waltersdorfer Straße 67, 02779 Großschönau',
    phone: '035841 / 35551',
    email: 'kontakt@pension-deutsche-eiche.de',
    website: 'http://www.pension-hotel-lausitz.de/pension-im-zittauer-gebirge',
  },
  {
    name: 'Pension „Auf der Heide“',
    description: 'In Waltersdorf, unweit der Strecke gelegen.',
    address: 'Hauptstraße 120, 02799 Waltersdorf',
    phone: '035841 / 3060',
    email: 'info@gasthofaufderheide.de',
    website: 'http://www.gasthofaufderheide.de/',
  },
  {
    name: 'Sonnebergbaude',
    description: 'In Waltersdorf, unweit der Strecke mit Blick auf die Lausche gelegen.',
    address: 'Hauptstraße 154, 02799 Waltersdorf',
    phone: '035841 / 3300',
    email: 'sonnebergbaude@gmx.de',
    website: 'http://www.sonnebergbaude.de/',
  },
  {
    name: 'Ferienwohnung Familie Hockert',
    description: 'In Saalendorf am Fahrerlager 2',
    address: 'OT Saalendorf 14, 02799 Waltersdorf',
    phone: '035841 / 36372',
    email: 'ferienwohnung-hockert@gmx.de',
    website: 'http://www.ferienwohnung-hockert.de/',
  },
  {
    name: 'Ferienwohnung Mandau Insel',
    description: 'In Mittelherwigsdorf gelegen.',
    address: 'Mandauufer 11, 02763 Mittelherwigsdorf',
    phone: '03583 / 794710',
    email: 'info@fewo-mandau-insel.de',
    website: 'http://www.fewo-mandau-insel.de/',
  },
  {
    name: 'Ferienwohnung Anne Leipert',
    description: 'In Saalendorf gelegen.',
    address: 'OT Saalendorf 13, 02799 Waltersdorf',
    phone: '0176 23687317',
    email: 'ferienhausfreunde@email.de',
    website: 'http://www.ferienhausfreun.de/',
  },
  {
    name: 'Bungalow in Großschönau – Fam. Grosse',
    description: 'In Großschönau gelegen.',
    address: 'Waltersdorfer Straße 151a, 02779 Großschönau',
    phone: '035841 / 35572',
    email: 'touristinfo@grossschoenau.de',
  },
];

export default function AccommodationPage() {
  const { locale } = useLanguage();

  const introContent = useContentWithFallback('event', 'accommodation_intro', {
    title: localize(locale, {
      de: 'Übernachtungsmöglichkeiten',
      cz: 'Ubytovani',
      en: 'Accommodation',
      pl: 'Noclegi',
    }),
    content: localize(locale, {
      de: 'Hier gibt es eine Übersicht von Übernachtungsmöglichkeiten im direkten Umfeld des Oberlausitzer Dreiecks.',
      cz: 'Prehled ubytovacich moznosti v okoli Horniho Luzickeho trojuhelniku.',
      en: 'Here is an overview of accommodation options near the Oberlausitz Triangle.',
      pl: 'Tutaj znajdziesz przeglad noclegow w bezposrednim otoczeniu Oberlausitzer Dreieck.',
    }),
  });

  const listContent = useContentWithFallback('event', 'accommodation_list', {
    content: '',
  });

  let accommodations: Accommodation[] = FALLBACK_ACCOMMODATIONS;
  if (listContent.hasDbContent && listContent.content) {
    try {
      accommodations = JSON.parse(listContent.content);
    } catch {
      // If it's not JSON, keep the fallback
    }
  }

  return (
    <MainLayout
      title={introContent.title}
      description={introContent.content}
      canonicalPath="/event/accommodation"
    >
      <PageHeader
        title={introContent.title}
        subtitle={introContent.content}
      />

      <section className="py-16">
        <div className="container">
          <div className="mb-8">
            <Button variant="outline" asChild>
              <Link to="/event">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {localize(locale, {
                  de: 'Zurück zur Veranstaltung',
                  cz: 'Zpet na akci',
                  en: 'Back to Event',
                  pl: 'Powrot do wydarzenia',
                })}
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accommodations.map((acc) => (
              <Card key={acc.name} className="group transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BedDouble className="h-5 w-5 text-primary" />
                    {acc.website ? (
                      <a href={acc.website} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                        {acc.name}
                        <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
                      </a>
                    ) : acc.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{acc.description}</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{acc.address}</span>
                    </div>
                    {acc.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-primary" />
                        <a href={`tel:${acc.phone.replace(/\s/g, '')}`} className="hover:text-primary">{acc.phone}</a>
                      </div>
                    )}
                    {acc.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-primary" />
                        <a href={`mailto:${acc.email}`} className="hover:text-primary">{acc.email}</a>
                      </div>
                    )}
                    {acc.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 shrink-0 text-primary" />
                        <a href={acc.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-primary">
                          {acc.website.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-12 border-l-4 border-l-accent">
            <CardContent className="p-6 text-muted-foreground">
              <p>
                {locale === 'de'
                  ? <>Bei der Suche nach weiteren Unterkuenften hilft die Website des <a href="http://www.zittauer-gebirge.com/cms/de/gastlichkeit" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Naturparks Zittauer Gebirge<ExternalLink className="ml-1 inline h-3.5 w-3.5" /></a> oder <a href="https://www.dormino.de/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">dormino.de<ExternalLink className="ml-1 inline h-3.5 w-3.5" /></a> (Ort: Grossschoenau).</>
                  : locale === 'cz'
                    ? <>Dalsi ubytovani najdete na strankach <a href="http://www.zittauer-gebirge.com/cms/de/gastlichkeit" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Prirodniho parku Zitavske hory<ExternalLink className="ml-1 inline h-3.5 w-3.5" /></a>.</>
                    : locale === 'pl'
                      ? <>Wiecej noclegow znajdziesz na stronie <a href="http://www.zittauer-gebirge.com/cms/de/gastlichkeit" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Parku Przyrodniczego Gor Zytawskich<ExternalLink className="ml-1 inline h-3.5 w-3.5" /></a> lub <a href="https://www.dormino.de/" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">dormino.de<ExternalLink className="ml-1 inline h-3.5 w-3.5" /></a>.</>
                      : <>For more accommodation options, visit the <a href="http://www.zittauer-gebirge.com/cms/de/gastlichkeit" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Zittau Mountains Nature Park<ExternalLink className="ml-1 inline h-3.5 w-3.5" /></a> website.</>
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}

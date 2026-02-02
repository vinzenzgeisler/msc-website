import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Download, 
  Image, 
  Clock, 
  Car, 
  Bike,
  ChevronRight,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock schedule data
const scheduleDay1 = [
  { time: '07:00', title: 'Öffnung Fahrerlager', category: 'general' },
  { time: '08:00', title: 'Technische Abnahme', category: 'general' },
  { time: '09:00', title: 'Fahrerbesprechung', category: 'general' },
  { time: '10:00', title: 'Training Rennmotorräder', category: 'motorcycles' },
  { time: '11:00', title: 'Training Seitenwagen', category: 'sidecars' },
  { time: '12:00', title: 'Mittagspause', category: 'general' },
  { time: '13:00', title: 'Demolauf 1 - Rennmotorräder', category: 'motorcycles' },
  { time: '14:30', title: 'Demolauf 1 - Seitenwagen', category: 'sidecars' },
  { time: '16:00', title: 'Demolauf 1 - Formelwagen', category: 'formula' },
  { time: '17:30', title: 'Abendprogramm im Festzelt', category: 'general' },
];

const scheduleDay2 = [
  { time: '08:00', title: 'Öffnung Fahrerlager', category: 'general' },
  { time: '09:00', title: 'Warmup alle Klassen', category: 'general' },
  { time: '10:00', title: 'Demolauf 2 - Rennmotorräder', category: 'motorcycles' },
  { time: '11:30', title: 'Demolauf 2 - Seitenwagen', category: 'sidecars' },
  { time: '13:00', title: 'Mittagspause', category: 'general' },
  { time: '14:00', title: 'Demolauf 2 - Karts', category: 'karts' },
  { time: '15:00', title: 'Demolauf 2 - Tourenwagen', category: 'touring' },
  { time: '16:30', title: 'Siegerehrung', category: 'general' },
  { time: '17:00', title: 'Veranstaltungsende', category: 'general' },
];

const participantClasses = [
  { icon: Bike, name: 'Rennmotorräder', description: 'Historische und moderne Rennmaschinen' },
  { icon: Users, name: 'Seitenwagen', description: 'Spektakuläre Gespanne auf der Bergstrecke' },
  { icon: Car, name: 'Karts', description: 'Schnelle Karts auf dem Asphalt' },
  { icon: Car, name: 'Formelwagen', description: 'Formelfahrzeuge verschiedener Klassen' },
  { icon: Car, name: 'Tourenwagen', description: 'Seriennahe und modifizierte Fahrzeuge' },
];

export default function EventPage() {
  const t = useTranslation();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="racing-stripe h-full w-full" />
        </div>
        <div className="absolute -right-20 top-0 h-full w-40 skew-x-[-15deg] bg-accent opacity-80" />
        
        <div className="container relative z-10">
          <Badge className="mb-4 bg-accent text-accent-foreground">
            12./13. September 2026
          </Badge>
          <h1 className="mb-4 text-5xl font-black uppercase md:text-6xl">
            {t.event.title}
          </h1>
          <p className="max-w-2xl text-xl text-primary-foreground/80">
            {t.event.subtitle} – {t.event.description}
          </p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="border-b border-border bg-muted/50 py-4">
        <div className="container">
          <div className="flex flex-wrap gap-2">
            {[
              { href: '#track', label: t.event.track, icon: MapPin },
              { href: '#schedule', label: t.event.schedule, icon: Clock },
              { href: '#classes', label: t.event.classes.title, icon: Users },
              { href: '#visitors', label: t.event.visitors, icon: Info },
              { href: '#downloads', label: t.event.downloads, icon: Download },
            ].map((item) => (
              <Button key={item.href} variant="outline" size="sm" asChild>
                <a href={item.href}>
                  <item.icon className="mr-1 h-4 w-4" />
                  {item.label}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Track & Region */}
      <section id="track" className="py-16">
        <div className="container">
          <h2 className="mb-8">{t.event.track}</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-lg text-muted-foreground">
                Die legendäre Strecke führt auf 5,9 km durch das malerische 
                Zittauer Gebirge, vorbei an den Orten Saalendorf, Jonsdorf und 
                Waltersdorf – mitten im Dreiländereck Deutschland-Polen-Tschechien.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Streckenlänge: 5,9 km</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Start: Saalendorf</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Ziel: Waltersdorf</span>
                </li>
              </ul>
            </div>
            <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted">
              <span className="text-muted-foreground">Streckenkarte (Platzhalter)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Participant Classes */}
      <section id="classes" className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-8">{t.event.classes.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {participantClasses.map((cls) => (
              <Card key={cls.name} className="text-center">
                <CardContent className="p-6">
                  <cls.icon className="mx-auto mb-3 h-10 w-10 text-primary" />
                  <h3 className="mb-1 text-lg font-semibold">{cls.name}</h3>
                  <p className="text-sm text-muted-foreground">{cls.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section id="schedule" className="py-16">
        <div className="container">
          <h2 className="mb-8">{t.event.schedule}</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Day 1 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Samstag, 12. September 2026
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {scheduleDay1.map((item, index) => (
                    <li key={index} className="flex gap-4 border-b border-border pb-3 last:border-0">
                      <span className="w-14 shrink-0 font-mono text-sm font-semibold text-primary">
                        {item.time}
                      </span>
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Day 2 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Sonntag, 13. September 2026
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {scheduleDay2.map((item, index) => (
                    <li key={index} className="flex gap-4 border-b border-border pb-3 last:border-0">
                      <span className="w-14 shrink-0 font-mono text-sm font-semibold text-primary">
                        {item.time}
                      </span>
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Visitor Information */}
      <section id="visitors" className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-8">{t.event.visitors}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Anreise</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Mit dem Auto über die B96 Richtung Zittau, Abfahrt Oybin/Jonsdorf.
                  Kostenlose Parkplätze vorhanden.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Eintritt</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Tageskarte: 15 € | Wochenendkarte: 25 €<br />
                  Kinder bis 14 Jahre frei
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Fahrerlager</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Lager 1: Motorräder + Festzelt<br />
                  Lager 2: Seitenwagen + Rennwagen
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section id="downloads" className="py-16">
        <div className="container">
          <h2 className="mb-8">{t.event.downloads}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Programmheft 2026', type: 'PDF', size: '2.5 MB' },
              { title: 'Ausschreibung', type: 'PDF', size: '1.2 MB' },
              { title: 'Anmeldeformular', type: 'PDF', size: '0.5 MB' },
              { title: 'Streckenkarte', type: 'PDF', size: '0.8 MB' },
            ].map((download) => (
              <Card key={download.title} className="group cursor-pointer transition-shadow hover:shadow-lg">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-primary">{download.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {download.type} • {download.size}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Teaser */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2>{t.event.gallery}</h2>
            <Button variant="outline" asChild>
              <Link to="/event/gallery">
                Alle Bilder
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex aspect-video items-center justify-center rounded-lg bg-muted border border-border"
              >
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archive */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-8">{t.event.archive}</h2>
          <div className="flex flex-wrap gap-3">
            {[2025, 2024, 2023, 2022, 2019, 2018].map((year) => (
              <Button key={year} variant="outline" asChild>
                <Link to={`/event/archive/${year}`}>{year}</Link>
              </Button>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

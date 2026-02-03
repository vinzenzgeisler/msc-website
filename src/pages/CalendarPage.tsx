import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { MapPin, Clock, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { de } from 'date-fns/locale';
import { format, isSameMonth, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

type Category = 'all' | 'club' | 'event' | 'training' | 'orgTeam';

// Mock calendar data - more extensive for a realistic calendar
const calendarEvents = [
  {
    id: 1,
    date: '2026-01-15',
    time: '19:00',
    title: 'Org-Team Sitzung',
    description: 'Monatliches Treffen des Organisationsteams zur Vorbereitung des Oberlausitzer Dreiecks.',
    location: 'Vereinsheim Großschönau',
    category: 'orgTeam' as const,
  },
  {
    id: 2,
    date: '2026-02-20',
    time: '18:00',
    title: 'Jahreshauptversammlung',
    description: 'Ordentliche Jahreshauptversammlung mit Vorstandswahlen und Jahresrückblick.',
    location: 'Vereinsheim Großschönau',
    category: 'club' as const,
  },
  {
    id: 3,
    date: '2026-03-15',
    time: '19:00',
    title: 'Org-Team Sitzung',
    description: 'Planungstreffen für die kommende Saison.',
    location: 'Vereinsheim Großschönau',
    category: 'orgTeam' as const,
  },
  {
    id: 4,
    date: '2026-04-12',
    time: '09:00',
    title: 'Frühjahrsausfahrt Motorradtouristik',
    description: 'Erste gemeinsame Ausfahrt der Saison. Route wird noch bekannt gegeben.',
    location: 'Treffpunkt: Tankstelle Großschönau',
    category: 'club' as const,
  },
  {
    id: 5,
    date: '2026-04-26',
    time: '10:00',
    title: 'Trial Training',
    description: 'Offenes Training für Trial-Interessierte. Eigenes Fahrzeug erforderlich.',
    location: 'Trial-Gelände Jonsdorf',
    category: 'training' as const,
  },
  {
    id: 6,
    date: '2026-05-10',
    time: '09:00',
    title: 'Motocross Training',
    description: 'Training auf der vereinseigenen Strecke. Für Mitglieder kostenfrei.',
    location: 'MX-Strecke Oderwitz',
    category: 'training' as const,
  },
  {
    id: 7,
    date: '2026-05-17',
    time: '19:00',
    title: 'Org-Team Sitzung',
    description: 'Zwischenstand Sponsoring und Genehmigungen.',
    location: 'Vereinsheim Großschönau',
    category: 'orgTeam' as const,
  },
  {
    id: 8,
    date: '2026-06-07',
    time: '09:00',
    title: 'Sommerausfahrt nach Tschechien',
    description: 'Tagesausfahrt ins Böhmische. Ca. 200 km, Einkehr geplant.',
    location: 'Treffpunkt: Grenzübergang Zittau',
    category: 'club' as const,
  },
  {
    id: 9,
    date: '2026-06-21',
    time: '10:00',
    title: 'Trial Training',
    description: 'Fortgeschrittenen-Training mit Gasttrainer.',
    location: 'Trial-Gelände Jonsdorf',
    category: 'training' as const,
  },
  {
    id: 10,
    date: '2026-07-19',
    time: '19:00',
    title: 'Org-Team Sitzung',
    description: 'Finale Abstimmungen für die Veranstaltung.',
    location: 'Vereinsheim Großschönau',
    category: 'orgTeam' as const,
  },
  {
    id: 11,
    date: '2026-08-02',
    time: '09:00',
    title: 'Motorradtouristik: Zittauer Gebirge',
    description: 'Rundfahrt durch das Zittauer Gebirge mit Besuch der Schmalspurbahn.',
    location: 'Treffpunkt: Oybin Bahnhof',
    category: 'club' as const,
  },
  {
    id: 12,
    date: '2026-08-23',
    time: '19:00',
    title: 'Org-Team Sitzung',
    description: 'Letzte Vorbereitungen, Helfer-Einteilung.',
    location: 'Vereinsheim Großschönau',
    category: 'orgTeam' as const,
  },
  {
    id: 13,
    date: '2026-09-05',
    time: '09:00',
    title: 'Streckenaufbau',
    description: 'Aufbau der Absperrungen und Infrastruktur.',
    location: 'Strecke Saalendorf-Waltersdorf',
    category: 'event' as const,
  },
  {
    id: 14,
    date: '2026-09-12',
    time: '07:00',
    endDate: '2026-09-13',
    title: '12. Oberlausitzer Dreieck',
    description: 'Das Hauptevent des Jahres! Demoläufe auf der 5,9 km langen Bergstrecke.',
    location: 'Saalendorf – Jonsdorf – Waltersdorf',
    category: 'event' as const,
    highlight: true,
  },
  {
    id: 15,
    date: '2026-09-14',
    time: '08:00',
    title: 'Streckenabbau',
    description: 'Abbau und Aufräumarbeiten.',
    location: 'Strecke Saalendorf-Waltersdorf',
    category: 'event' as const,
  },
  {
    id: 16,
    date: '2026-10-11',
    time: '09:00',
    title: 'Abschlussfahrt Motorradtouristik',
    description: 'Letzte Ausfahrt der Saison mit gemütlichem Ausklang.',
    location: 'Treffpunkt: Tankstelle Großschönau',
    category: 'club' as const,
  },
  {
    id: 17,
    date: '2026-11-15',
    time: '18:00',
    title: 'Helfer-Dankeschön',
    description: 'Dankesveranstaltung für alle Helfer des Oberlausitzer Dreiecks.',
    location: 'Vereinsheim Großschönau',
    category: 'club' as const,
  },
  {
    id: 18,
    date: '2026-12-12',
    time: '18:00',
    title: 'Weihnachtsfeier',
    description: 'Traditionelle Weihnachtsfeier des MSC mit Tombola.',
    location: 'Vereinsheim Großschönau',
    category: 'club' as const,
  },
];

const categoryConfig: Record<Category, { label: string; color: string; bgColor: string }> = {
  all: { label: 'Alle', color: 'text-foreground', bgColor: 'bg-muted' },
  club: { label: 'Verein', color: 'text-primary-foreground', bgColor: 'bg-primary' },
  event: { label: 'Veranstaltung', color: 'text-accent-foreground', bgColor: 'bg-accent' },
  training: { label: 'Training', color: 'text-white', bgColor: 'bg-green-600' },
  orgTeam: { label: 'Org-Team', color: 'text-white', bgColor: 'bg-purple-600' },
};

export default function CalendarPage() {
  const t = useTranslation();
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // Start in January 2026

  const filteredEvents = calendarEvents
    .filter((event) => activeFilter === 'all' || event.category === activeFilter)
    .filter((event) => {
      if (selectedDate) {
        return isSameDay(new Date(event.date), selectedDate);
      }
      return isSameMonth(new Date(event.date), currentMonth);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get dates that have events for highlighting in calendar
  const eventDates = calendarEvents.map((e) => new Date(e.date));

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
    setSelectedDate(undefined);
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2">{t.calendar.title}</h1>
          <p className="text-lg text-primary-foreground/80">
            Alle Termine des MSC Oberlausitzer Dreiländereck e.V.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
            {/* Sidebar with Calendar and Filters */}
            <div className="space-y-6">
              {/* Mini Calendar */}
              <Card>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleMonthChange('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold">
                      {format(currentMonth, 'MMMM yyyy', { locale: de })}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleMonthChange('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    locale={de}
                    className="pointer-events-auto"
                    modifiers={{
                      hasEvent: eventDates,
                    }}
                    modifiersClassNames={{
                      hasEvent: 'bg-primary/20 font-bold',
                    }}
                  />
                  {selectedDate && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => setSelectedDate(undefined)}
                    >
                      Alle Termine im Monat anzeigen
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-3 font-semibold">Kategorien</h3>
                  <div className="flex flex-col gap-2">
                    {(Object.keys(categoryConfig) as Category[]).map((cat) => (
                      <Button
                        key={cat}
                        variant={activeFilter === cat ? 'default' : 'ghost'}
                        size="sm"
                        className="justify-start"
                        onClick={() => setActiveFilter(cat)}
                      >
                        <span 
                          className={`mr-2 h-3 w-3 rounded-full ${categoryConfig[cat].bgColor}`} 
                        />
                        {categoryConfig[cat].label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ICS Export */}
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Kalender exportieren (ICS)
              </Button>
            </div>

            {/* Events List */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {selectedDate 
                    ? format(selectedDate, 'd. MMMM yyyy', { locale: de })
                    : format(currentMonth, 'MMMM yyyy', { locale: de })
                  }
                </h2>
                <span className="text-muted-foreground">
                  {filteredEvents.length} Termin{filteredEvents.length !== 1 ? 'e' : ''}
                </span>
              </div>

              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className={`overflow-hidden transition-shadow hover:shadow-lg ${
                      event.highlight ? 'border-2 border-accent' : ''
                    }`}
                  >
                    <CardContent className="flex gap-4 p-0">
                      {/* Date sidebar */}
                      <div className={`flex w-24 shrink-0 flex-col items-center justify-center p-4 ${categoryConfig[event.category].bgColor} ${categoryConfig[event.category].color}`}>
                        <span className="text-3xl font-black">
                          {new Date(event.date).getDate()}
                        </span>
                        <span className="text-sm font-medium uppercase">
                          {format(new Date(event.date), 'MMM', { locale: de })}
                        </span>
                        {event.endDate && (
                          <span className="mt-1 text-xs opacity-80">
                            – {new Date(event.endDate).getDate()}.
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 py-4 pr-4">
                        <div className="mb-1 flex items-center gap-2">
                          <span className={`rounded px-2 py-0.5 text-xs font-semibold ${categoryConfig[event.category].bgColor} ${categoryConfig[event.category].color}`}>
                            {categoryConfig[event.category].label}
                          </span>
                          {event.highlight && (
                            <span className="rounded bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                              Hauptevent
                            </span>
                          )}
                        </div>
                        
                        <h3 className="mb-2 text-lg font-bold">{event.title}</h3>
                        
                        <p className="mb-3 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.time} Uhr
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredEvents.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-border py-12 text-center text-muted-foreground">
                    <p>Keine Termine gefunden.</p>
                    <p className="mt-1 text-sm">
                      Wähle einen anderen Monat oder eine andere Kategorie.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

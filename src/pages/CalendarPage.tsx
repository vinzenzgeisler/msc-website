import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

type Category = 'all' | 'club' | 'event' | 'training' | 'orgTeam';

// Mock calendar data
const calendarEvents = [
  {
    id: 1,
    date: '2026-01-15',
    time: '19:00',
    title: 'Org-Team Sitzung',
    location: 'Vereinsheim',
    category: 'orgTeam' as const,
  },
  {
    id: 2,
    date: '2026-02-20',
    time: '18:00',
    title: 'Jahreshauptversammlung',
    location: 'Vereinsheim',
    category: 'club' as const,
  },
  {
    id: 3,
    date: '2026-03-15',
    time: '19:00',
    title: 'Org-Team Sitzung',
    location: 'Vereinsheim',
    category: 'orgTeam' as const,
  },
  {
    id: 4,
    date: '2026-04-20',
    time: '09:00',
    title: 'Saisonstart Motorradtouristik',
    location: 'Treffpunkt wird bekannt gegeben',
    category: 'club' as const,
  },
  {
    id: 5,
    date: '2026-05-10',
    time: '10:00',
    title: 'Trial Training',
    location: 'Trial-Gelände',
    category: 'training' as const,
  },
  {
    id: 6,
    date: '2026-06-15',
    time: '19:00',
    title: 'Org-Team Sitzung',
    location: 'Vereinsheim',
    category: 'orgTeam' as const,
  },
  {
    id: 7,
    date: '2026-09-12',
    time: '07:00',
    endDate: '2026-09-13',
    title: '12. Oberlausitzer Dreieck',
    location: 'Saalendorf - Jonsdorf - Waltersdorf',
    category: 'event' as const,
  },
  {
    id: 8,
    date: '2026-12-12',
    time: '18:00',
    title: 'Weihnachtsfeier',
    location: 'Vereinsheim',
    category: 'club' as const,
  },
];

export default function CalendarPage() {
  const t = useTranslation();
  const [activeFilter, setActiveFilter] = useState<Category>('all');

  const filteredEvents = activeFilter === 'all'
    ? calendarEvents
    : calendarEvents.filter((event) => event.category === activeFilter);

  const categoryColors: Record<Category, string> = {
    all: 'bg-muted text-muted-foreground',
    club: 'bg-primary/10 text-primary',
    event: 'bg-accent/20 text-accent-foreground',
    training: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    orgTeam: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.calendar.title}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Alle Termine des MSC Oberlausitzer Dreiländereck e.V.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-muted/50 py-4">
        <div className="container">
          <div className="flex flex-wrap gap-2">
            {(['all', 'club', 'event', 'training', 'orgTeam'] as const).map((cat) => (
              <Button
                key={cat}
                variant={activeFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(cat)}
              >
                {t.calendar.filter[cat]}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-12">
        <div className="container">
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                  {/* Date Box */}
                  <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <span className="text-2xl font-bold">
                      {new Date(event.date).getDate()}
                    </span>
                    <span className="text-sm uppercase">
                      {new Date(event.date).toLocaleDateString('de-DE', { month: 'short' })}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge className={categoryColors[event.category]}>
                        {t.calendar.filter[event.category]}
                      </Badge>
                      {event.endDate && (
                        <Badge variant="outline">Mehrtägig</Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
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

                  {/* Actions */}
                  <div className="shrink-0">
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Keine Termine in dieser Kategorie gefunden.
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}

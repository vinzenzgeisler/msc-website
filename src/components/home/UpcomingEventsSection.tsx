import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Calendar, Flag } from 'lucide-react';

// Mock data - will be replaced with database data
const events = [
  {
    id: 1,
    date: '2026-03-15',
    title: 'Org-Team Sitzung',
    category: 'orgTeam',
  },
  {
    id: 2,
    date: '2026-04-20',
    title: 'Saisonstart Motorradtouristik',
    category: 'club',
  },
  {
    id: 3,
    date: '2026-09-12',
    title: '12. Oberlausitzer Dreieck',
    category: 'event',
    highlight: true,
  },
];

export function UpcomingEventsSection() {
  const t = useTranslation();

  return (
    <section className="relative bg-muted/50 py-20 md:py-28">
      {/* Racing grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container relative">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
              {t.calendar.upcoming}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Die nächsten Termine im Überblick
            </p>
          </div>
          <Button 
            variant="outline" 
            className="group rounded-none font-semibold uppercase tracking-wider"
            asChild
          >
            <Link to="/calendar">
              {t.nav.calendar}
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className={`group relative overflow-hidden rounded-none border-2 transition-all hover:shadow-xl ${
                event.highlight 
                  ? 'border-accent bg-gradient-to-br from-accent/5 to-transparent hover:border-accent' 
                  : 'border-border hover:border-primary'
              }`}
            >
              {/* Highlight badge for main event */}
              {event.highlight && (
                <div className="absolute right-0 top-0 flex items-center gap-1 bg-accent px-3 py-1 text-xs font-bold uppercase text-accent-foreground">
                  <Flag className="h-3 w-3" />
                  Hauptevent
                </div>
              )}

              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className={`rounded-none px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    event.highlight 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {t.calendar.filter[event.category as keyof typeof t.calendar.filter]}
                  </span>
                </div>
                
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.date).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                
                <h3 className={`text-xl font-bold transition-colors ${
                  event.highlight 
                    ? 'text-foreground group-hover:text-accent' 
                    : 'text-foreground group-hover:text-primary'
                }`}>
                  {event.title}
                </h3>
              </CardContent>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full ${
                event.highlight ? 'bg-accent' : 'bg-primary'
              }`} />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

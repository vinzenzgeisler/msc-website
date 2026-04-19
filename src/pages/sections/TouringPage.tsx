import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Mail,
  ArrowRight,
  Route,
  CalendarX,
} from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/i18n/LanguageContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { DisciplineEventCard } from '@/components/sections/DisciplineEventCard';
import { RichContent } from '@/components/content/RichContent';
import { ContactSection } from '@/components/sections/ContactSection';

import heroTouring from '@/assets/event-melkus.jpg';

export default function TouringPage() {
  const t = useTranslation();
  const { data: settings } = useSettings();
  const { data: calendarEvents } = useCalendarEvents();

  const intro = useContentWithFallback('touring', 'intro', {
    title: 'Motorradtouristik',
    subtitle: 'Gemeinsam die Oberlausitz und Nachbarländer entdecken',
    content:
      'Die Sektion Motorradtouristik organisiert regelmäßig Tages- und Mehrtagestouren durch die wunderschöne Landschaft der Oberlausitz, ins Zittauer Gebirge und in die angrenzenden Regionen Tschechiens und Polens. Ob Anfänger oder erfahrener Tourenfahrer – bei uns ist jeder willkommen.',
  });

  const toursCurrent = useContentWithFallback('touring', 'tours_current', {
    title: 'Motorradtouren 2025',
    content: `<div class="tour-item">
<strong>Tour 1 – 13.06.–15.06.2025</strong><br/>
Tour ins Adlergebirge nach Jánské Lázně<br/>
<em>Anmeldeschluss – keine Teilnahme mehr möglich.</em>
</div>`,
  });

  const toursArchive = useContentWithFallback('touring', 'tours_archive', {
    title: 'Tourenarchiv',
    subtitle: 'Vergangene Touren',
    content: `<div class="tour-item"><strong>2024 – Tour 8</strong><br/>22.09.2024 · Automuseum Lučany und Kozákov</div>
<div class="tour-item"><strong>2024 – Tour 7</strong><br/>11.08.2024 · Kloster und Schloss Doksany</div>
<div class="tour-item"><strong>2024 – Tour 6</strong><br/>21.07.2024 · Zum Petřín</div>
<div class="tour-item"><strong>2024 – Tour 5</strong><br/>14.07.2024 · Bílina und Kloster Ossegg</div>
<div class="tour-item"><strong>2024 – Tour 4</strong><br/>23.06.2024 · Kirche Markvatice und Glasausstellung Kunratice</div>
<div class="tour-item"><strong>2024 – Tour 3</strong><br/>12.05.2024 · Turnov, Burg Hrubý Rohozec</div>
<div class="tour-item"><strong>2024 – Tour 2</strong><br/>28.04.2024 · Josef-Stroll-Mausoleum, Levín, Kravaře</div>
<div class="tour-item"><strong>2024 – Tour 1</strong><br/>07.04.2024 · Zum Schloss Sychrov</div>`,
  });

  const eventsContent = useContentWithFallback('touring', 'events', {
    title: 'Kommende Termine',
  });

  const contact = useContentWithFallback('touring', 'contact', {});

  const heroImage = intro.image_url || heroTouring;

  const upcomingEvents = (calendarEvents || [])
    .filter((e) => e.category === 'touring' && e.published && new Date(e.start_dt) >= new Date())
    .slice(0, 3);

  return (
    <MainLayout>
      <PageHeader
        title={intro.title || 'Motorradtouristik'}
        subtitle={intro.subtitle}
        imageUrl={intro.header_image_url || undefined}
        imageAlt={intro.header_image_alt || intro.title || 'Motorradtouristik'}
      />

      {/* Intro */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-0 lg:grid-cols-2">
            {/* Text side */}
            <div className="relative bg-primary p-8 md:p-12 flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />

              {intro.content && (
                <RichContent
                  content={intro.content}
                  className="text-lg text-primary-foreground/90 prose-invert [&_strong]:text-accent"
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

            {/* Image side */}
            <div className="relative min-h-[300px] lg:min-h-[400px]">
              <img
                src={heroImage}
                alt={intro.image_alt || 'Motorradtouristik'}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <Route className="h-6 w-6 text-primary" />
              {eventsContent.title || 'Kommende Touren'}
            </h2>
            <Button variant="outline" className="rounded-none font-semibold uppercase tracking-wider" asChild>
              <Link to="/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Alle Termine
              </Link>
            </Button>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {upcomingEvents.map((event) => (
                <DisciplineEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-none border-2 border-dashed border-border bg-card p-12 text-center">
              <CalendarX className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Derzeit keine anstehenden Touren geplant.</p>
            </div>
          )}
        </div>
      </section>

      <ContactSection
        title={contact.title}
        content={contact.content}
        subtitle={contact.subtitle}
        primaryLabel={contact.primary_button_label}
        primaryUrl={contact.primary_button_url}
        secondaryLabel={contact.secondary_button_label}
        secondaryUrl={contact.secondary_button_url}
      />

      {/* Tour Archive */}
      <section className="border-t border-border py-16">
        <div className="container">
          <h2 className="mb-2 text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            {toursArchive.title}
          </h2>
          {toursArchive.subtitle && (
            <p className="mb-8 text-muted-foreground">{toursArchive.subtitle}</p>
          )}
          {toursArchive.content && (
            <RichContent
              content={toursArchive.content}
              className="[&_.tour-item]:border-l-2 [&_.tour-item]:border-muted-foreground/30 [&_.tour-item]:pl-4 [&_.tour-item]:py-2 [&_.tour-item]:mb-2 [&_.tour-item]:text-sm"
            />
          )}
        </div>
      </section>

    </MainLayout>
  );
}

import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ExternalLink,
  CalendarX,
} from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useTranslation } from '@/i18n/LanguageContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { DisciplineEventCard } from '@/components/sections/DisciplineEventCard';
import { RichContent } from '@/components/content/RichContent';
import { ContactSection } from '@/components/sections/ContactSection';

import heroTrial from '@/assets/event-start-2.jpg';

export default function TrialPage() {
  const t = useTranslation();
  const { data: calendarEvents } = useCalendarEvents(false);

  const intro = useContentWithFallback('trial', 'intro', {
    title: 'Trial',
    subtitle: 'Geschicklichkeit auf zwei Rädern',
    content:
      'Die Sektion Trial des MSC Oberlausitzer Dreiländereck widmet sich dem faszinierenden Geschicklichkeitssport auf dem Motorrad. Trial erfordert Balance, Konzentration und Technik – nicht Geschwindigkeit.',
  });

  const contact = useContentWithFallback('trial', 'contact', {});

  const eventsContent = useContentWithFallback('trial', 'events', {
    title: 'Kommende Termine',
  });

  const heroImage = intro.image_url || heroTrial;

  const upcomingEvents = (calendarEvents || [])
    .filter((e) => e.category === 'trial' && e.published && new Date(e.start_dt) >= new Date())
    .slice(0, 3);

  return (
    <MainLayout>
      <PageHeader
        title={intro.title || 'Trial'}
        subtitle={intro.subtitle}
        imageUrl={intro.header_image_url || undefined}
        imageAlt={intro.header_image_alt || intro.title || 'Trial'}
      />

      {/* Intro */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-0 lg:grid-cols-2">
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

            <div className="relative min-h-[300px] lg:min-h-[400px]">
              <img
                src={heroImage}
                alt={intro.image_alt || 'Trial'}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact (only when configured in CMS) */}
      {contact.hasDbContent && (contact.title || contact.content) && (
        <ContactSection
          title={contact.title || 'Ansprechpartner'}
          content={contact.content}
          subtitle={contact.subtitle}
          primaryLabel={contact.primary_button_label}
          primaryUrl={contact.primary_button_url}
          secondaryLabel={contact.secondary_button_label}
          secondaryUrl={contact.secondary_button_url}
        />
      )}

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

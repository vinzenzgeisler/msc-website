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
} from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/i18n/LanguageContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import heroTrial from '@/assets/event-start-2.jpg';

export default function TrialPage() {
  const t = useTranslation();
  const { data: settings } = useSettings();
  const { data: calendarEvents } = useCalendarEvents(false);

  const intro = useContentWithFallback('trial', 'intro', {
    title: 'Trial',
    subtitle: 'Geschicklichkeit auf zwei Rädern',
    content:
      'Die Sektion Trial des MSC Oberlausitzer Dreiländereck widmet sich dem faszinierenden Geschicklichkeitssport auf dem Motorrad. Trial erfordert Balance, Konzentration und Technik – nicht Geschwindigkeit.',
  });

  const contact = useContentWithFallback('trial', 'contact', {
    title: 'Ansprechpartner Trial',
    content: `<strong>Stefan Funke</strong><br/>Kirchstr. 8<br/>02791 Oderwitz`,
    subtitle: 'Tel.: 0172 7346799',
  });

  const eventsContent = useContentWithFallback('trial', 'events', {
    title: 'Kommende Termine',
  });

  const heroImage = intro.image_url || heroTrial;

  const upcomingEvents = (calendarEvents || [])
    .filter((e) => e.category === 'trial' && e.published && new Date(e.start_dt) >= new Date())
    .slice(0, 3);

  return (
    <MainLayout>
      <PageHeader title={intro.title || 'Trial'} subtitle={intro.subtitle} />

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

      {/* Contact */}
      <section className="border-t border-border bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-8 text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            {contact.title}
          </h2>
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  {contact.content && (
                    <div
                      className="prose dark:prose-invert max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: contact.content }}
                    />
                  )}
                  {contact.subtitle && (
                    <p className="mt-3 flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {contact.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {contact.primary_button_url && (
                    <Button asChild>
                      <a href={contact.primary_button_url}>
                        <Mail className="mr-2 h-4 w-4" />
                        {contact.primary_button_label || 'E-Mail senden'}
                      </a>
                    </Button>
                  )}
                  {contact.secondary_button_url && (
                    <Button variant="outline" asChild>
                      <a
                        href={contact.secondary_button_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {contact.secondary_button_label || 'Weitere Infos'}
                        <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="border-t border-border py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">{eventsContent.title || 'Kommende Termine'}</h2>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {format(new Date(event.start_dt), 'dd. MMMM yyyy', { locale: de })}
                          {event.location && ` · ${event.location}`}
                        </p>
                        <h3 className="font-semibold">{event.title}</h3>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Derzeit keine anstehenden Termine.</p>
            )}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button asChild>
                <Link to="/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Alle Termine ansehen
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <a href={`mailto:${settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.de'}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Kontakt aufnehmen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Calendar, ChevronRight, Users } from 'lucide-react';

// Event date: September 12-13, 2026
const EVENT_DATE = new Date('2026-09-12T09:00:00');

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function HeroSection() {
  const t = useTranslation();
  const countdown = useCountdown(EVENT_DATE);

  return (
    <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-32">
      {/* Diagonal Racing Stripes Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 racing-stripe" />
      </div>
      
      {/* Accent diagonal stripe */}
      <div className="absolute -right-20 top-0 h-full w-40 skew-x-[-15deg] bg-accent opacity-80" />
      <div className="absolute -right-32 top-0 h-full w-20 skew-x-[-15deg] bg-accent opacity-40" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Event Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            <Calendar className="h-4 w-4" />
            {t.hero.eventDate}
          </div>

          {/* Main Title */}
          <h1 className="mb-6 text-5xl font-black uppercase tracking-tight md:text-7xl">
            {t.hero.eventTitle}
          </h1>

          <p className="mb-8 text-lg text-primary-foreground/80 md:text-xl">
            {t.event.description}
          </p>

          {/* Countdown */}
          <div className="mb-10 grid grid-cols-4 gap-4 md:gap-6">
            {[
              { value: countdown.days, label: t.hero.days },
              { value: countdown.hours, label: t.hero.hours },
              { value: countdown.minutes, label: t.hero.minutes },
              { value: countdown.seconds, label: t.hero.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg bg-background/10 p-3 backdrop-blur-sm md:p-6"
              >
                <div className="text-3xl font-black md:text-5xl">{item.value}</div>
                <div className="text-xs uppercase tracking-wider text-primary-foreground/70 md:text-sm">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent"
              asChild
            >
              <Link to="/event">
                {t.hero.ctaEvent}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/event#schedule">{t.hero.ctaSchedule}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClubTeaserSection() {
  const t = useTranslation();

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4">{t.clubTeaser.title}</h2>
          <p className="mb-2 text-xl font-semibold text-primary">
            {t.clubTeaser.subtitle}
          </p>
          <p className="mb-8 text-lg text-muted-foreground">
            {t.clubTeaser.description}
          </p>
          <Button asChild>
            <Link to="/club/about">
              {t.clubTeaser.cta}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function UpcomingEventsSection() {
  const t = useTranslation();

  // Mock data - will be replaced with Supabase data
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
    },
  ];

  return (
    <section className="bg-muted/50 py-16 md:py-24">
      <div className="container">
        <div className="mb-10 flex items-center justify-between">
          <h2>{t.calendar.upcoming}</h2>
          <Button variant="outline" asChild>
            <Link to="/calendar">
              {t.nav.calendar}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="group transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {t.calendar.filter[event.category as keyof typeof t.calendar.filter]}
                  </span>
                </div>
                <p className="mb-1 text-sm text-muted-foreground">
                  {new Date(event.date).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <h3 className="text-lg font-semibold group-hover:text-primary">
                  {event.title}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsorsSection() {
  // Mock sponsors - will be replaced with Supabase data
  const sponsors = [
    { id: 1, name: 'Havlat', tier: 'main' },
    { id: 2, name: 'DEKRA', tier: 'main' },
    { id: 3, name: 'Bergquell', tier: 'partner' },
    { id: 4, name: 'Auto-Fit', tier: 'partner' },
    { id: 5, name: 'Kummer', tier: 'partner' },
    { id: 6, name: 'Auto Jahn', tier: 'partner' },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="mb-10 text-center">Partner & Sponsoren</h2>
        
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex h-24 items-center justify-center rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <span className="text-lg font-semibold text-muted-foreground">
                {sponsor.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link to="/partners/sponsors">
              Alle Partner
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <ClubTeaserSection />
      <UpcomingEventsSection />
      <SponsorsSection />
    </MainLayout>
  );
};

export default Index;

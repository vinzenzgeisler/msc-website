import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';

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

export function HeroSection() {
  const t = useTranslation();
  const countdown = useCountdown(EVENT_DATE);

  return (
    <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground md:py-32">
      {/* Subtle diagonal stripes */}
      <div className="absolute inset-0 opacity-10">
        <div className="racing-stripe h-full w-full" />
      </div>
      
      {/* Accent stripe */}
      <div className="absolute -right-20 top-0 h-full w-40 skew-x-[-15deg] bg-accent opacity-90" />
      <div className="absolute -right-32 top-0 h-full w-16 skew-x-[-15deg] bg-accent/50" />

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Event Badge */}
          <div className="mb-6 inline-flex items-center gap-2 bg-accent px-5 py-2 text-sm font-bold uppercase tracking-wider text-accent-foreground">
            <Calendar className="h-4 w-4" />
            {t.hero.eventDate}
          </div>

          {/* Main Title */}
          <h1 className="mb-6 font-display text-5xl font-black uppercase tracking-tight md:text-7xl">
            {t.hero.eventTitle}
          </h1>

          <p className="mb-10 text-lg text-primary-foreground/80 md:text-xl">
            {t.event.description}
          </p>

          {/* Countdown */}
          <div className="mb-12 grid grid-cols-4 gap-4 md:gap-6">
            {[
              { value: countdown.days, label: t.hero.days },
              { value: countdown.hours, label: t.hero.hours },
              { value: countdown.minutes, label: t.hero.minutes },
              { value: countdown.seconds, label: t.hero.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-background/10 p-4 backdrop-blur-sm md:p-6"
              >
                <div className="font-display text-4xl font-black md:text-6xl">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-primary-foreground/70 md:text-sm">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-accent px-8 text-base font-bold uppercase tracking-wider text-accent-foreground hover:bg-accent/90"
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
              className="border-primary-foreground/30 px-8 text-base font-medium text-primary-foreground hover:bg-primary-foreground/10"
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

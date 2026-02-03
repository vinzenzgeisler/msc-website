import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Calendar } from 'lucide-react';
import { useMainEvent } from '@/hooks/useMainEvent';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useLanguage } from '@/i18n/LanguageContext';

// Fallback event date if no main event is set
const FALLBACK_EVENT_DATE = new Date('2026-09-12T09:00:00');
const FALLBACK_EVENT_TITLE = '12th Oberlausitzer Dreieck';

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
  const { locale } = useLanguage();
  const { data: mainEvent, isLoading } = useMainEvent();
  
  // Use main event data or fallback
  const eventDate = mainEvent ? new Date(mainEvent.start_dt) : FALLBACK_EVENT_DATE;
  const eventEndDate = mainEvent?.end_dt ? new Date(mainEvent.end_dt) : null;
  const eventTitle = mainEvent?.title || FALLBACK_EVENT_TITLE;
  const eventDescription = mainEvent?.description || t.event.description;
  
  const countdown = useCountdown(eventDate);
  
  // Format the event date display
  const formatEventDate = () => {
    const dateLocale = locale === 'de' ? de : enUS;
    const startFormatted = format(eventDate, 'MMMM d', { locale: dateLocale });
    
    if (eventEndDate) {
      const endFormatted = format(eventEndDate, 'd, yyyy', { locale: dateLocale });
      return `${startFormatted}-${endFormatted}`;
    }
    
    return format(eventDate, 'MMMM d, yyyy', { locale: dateLocale });
  };

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
            {isLoading ? (
              <Skeleton className="h-4 w-32 bg-accent-foreground/20" />
            ) : (
              formatEventDate()
            )}
          </div>

          {/* Main Title */}
          {isLoading ? (
            <Skeleton className="h-16 w-3/4 mx-auto mb-6 bg-primary-foreground/10" />
          ) : (
            <h1 className="mb-6 font-display text-5xl font-black uppercase tracking-tight md:text-7xl">
              {eventTitle}
            </h1>
          )}

          <p className="mb-10 text-lg text-primary-foreground/80 md:text-xl">
            {eventDescription}
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
              className="border-2 border-white/50 bg-white/10 px-8 text-base font-medium text-white hover:border-white hover:bg-white/20"
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

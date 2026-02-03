import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Flag } from 'lucide-react';

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
    <section className="relative min-h-[80vh] overflow-hidden bg-primary">
      {/* Checkered flag pattern background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, hsl(var(--foreground)) 25%, transparent 25%),
              linear-gradient(-45deg, hsl(var(--foreground)) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, hsl(var(--foreground)) 75%),
              linear-gradient(-45deg, transparent 75%, hsl(var(--foreground)) 75%)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
          }}
        />
      </div>

      {/* Dynamic diagonal stripes */}
      <div className="absolute inset-0">
        <div className="absolute -left-40 top-0 h-full w-[120%] skew-x-[-12deg] bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      </div>

      {/* Racing accent stripes */}
      <div className="absolute right-0 top-0 h-full w-2 bg-accent" />
      <div className="absolute right-4 top-0 h-full w-1 bg-accent/60" />
      <div className="absolute right-7 top-0 h-full w-0.5 bg-accent/30" />
      
      {/* Large diagonal accent */}
      <div className="absolute -right-32 top-0 h-full w-64 skew-x-[-12deg] bg-gradient-to-b from-accent via-accent to-accent/80" />
      <div className="absolute -right-48 top-0 h-full w-24 skew-x-[-12deg] bg-accent/40" />

      {/* Start/Finish line pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-4 flex">
        {Array.from({ length: 40 }).map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 ${i % 2 === 0 ? 'bg-foreground/20' : 'bg-transparent'}`} 
          />
        ))}
      </div>

      <div className="container relative z-10 flex min-h-[80vh] flex-col justify-center py-20">
        <div className="mx-auto max-w-5xl text-center text-primary-foreground">
          {/* Event Badge with racing flag */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-none border-2 border-accent bg-accent px-6 py-3 text-base font-black uppercase tracking-wider text-accent-foreground shadow-lg">
            <Flag className="h-5 w-5" />
            <span>{t.hero.eventDate}</span>
            <Flag className="h-5 w-5" />
          </div>

          {/* Main Title with racing style */}
          <h1 className="mb-6 text-6xl font-black uppercase tracking-tighter md:text-8xl lg:text-9xl">
            <span className="block text-primary-foreground drop-shadow-lg">
              {t.hero.eventTitle.split(' ').slice(0, 1).join(' ')}
            </span>
            <span className="block bg-gradient-to-r from-accent via-accent to-accent/80 bg-clip-text text-transparent">
              {t.hero.eventTitle.split(' ').slice(1).join(' ')}
            </span>
          </h1>

          <p className="mb-10 text-lg text-primary-foreground/80 md:text-xl lg:text-2xl">
            {t.event.description}
          </p>

          {/* Countdown with racing style boxes */}
          <div className="mb-12 grid grid-cols-4 gap-3 md:gap-6 lg:gap-8">
            {[
              { value: countdown.days, label: t.hero.days },
              { value: countdown.hours, label: t.hero.hours },
              { value: countdown.minutes, label: t.hero.minutes },
              { value: countdown.seconds, label: t.hero.seconds },
            ].map((item, index) => (
              <div
                key={item.label}
                className="group relative"
              >
                {/* Racing number plate style */}
                <div className="relative overflow-hidden rounded-none border-2 border-primary-foreground/20 bg-background/10 p-4 backdrop-blur-md transition-all duration-300 hover:border-accent md:p-6 lg:p-8">
                  {/* Diagonal accent corner */}
                  <div className="absolute -right-4 -top-4 h-8 w-8 rotate-45 bg-accent opacity-80" />
                  
                  <div className="font-mono text-4xl font-black tabular-nums md:text-6xl lg:text-7xl">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-widest text-primary-foreground/60 md:text-sm">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs with racing button style */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
            <Button
              size="lg"
              className="group relative overflow-hidden rounded-none border-2 border-accent bg-accent px-8 py-6 text-lg font-black uppercase tracking-wider text-accent-foreground transition-all hover:bg-accent/90 hover:shadow-[0_0_30px_hsl(var(--accent)/0.5)]"
              asChild
            >
              <Link to="/event">
                <span className="relative z-10 flex items-center gap-2">
                  {t.hero.ctaEvent}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-none border-2 border-primary-foreground/40 bg-transparent px-8 py-6 text-lg font-bold uppercase tracking-wider text-primary-foreground transition-all hover:border-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/event#schedule">
                <Calendar className="mr-2 h-5 w-5" />
                {t.hero.ctaSchedule}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

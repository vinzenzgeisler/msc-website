import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Calendar } from 'lucide-react';
import { useMainEvent } from '@/hooks/useMainEvent';
import { useSettings } from '@/hooks/useSettings';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { format } from 'date-fns';
import { cs, de, enUS } from 'date-fns/locale';
import { useLanguage } from '@/i18n/LanguageContext';

function isExternalUrl(url: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(url);
}

function renderHeroCta(
  url: string,
  children: React.ReactNode,
  buttonProps: {
    size: 'lg';
    variant?: 'outline';
    className: string;
  },
) {
  if (isExternalUrl(url)) {
    return (
      <Button {...buttonProps} asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button {...buttonProps} asChild>
      <Link to={url}>{children}</Link>
    </Button>
  );
}

function HeroPrimaryButton({
  url,
  label,
}: {
  url: string;
  label: string;
}) {
  return renderHeroCta(
    url,
    <>
      {label}
      <ArrowRight className="ml-2 h-4 w-4" />
    </>,
    {
      size: 'lg',
      className:
        'bg-accent px-8 text-base font-bold uppercase tracking-wider text-accent-foreground hover:bg-accent/90',
    },
  );
}

function HeroSecondaryButton({
  url,
  label,
}: {
  url: string;
  label: string;
}) {
  return renderHeroCta(url, label, {
    size: 'lg',
    variant: 'outline',
    className:
      'border-2 border-white/50 bg-white/10 px-8 text-base font-medium text-white hover:border-white hover:bg-white/20',
  });
}

function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!targetDate) {
      return null;
    }

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
  });

  const targetTimestamp = targetDate?.getTime() ?? null;

  useEffect(() => {
    if (targetTimestamp === null) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = targetTimestamp - now;

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

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTimestamp]);

  return timeLeft;
}

export function HeroSection() {
  const t = useTranslation();
  const { locale } = useLanguage();
  const { data: mainEvent, isLoading } = useMainEvent();
  const { data: settings } = useSettings();
  const heroContent = useContentWithFallback('home', 'hero', {
    title: settings?.site_name || t.clubTeaser.title,
    subtitle: settings?.description || t.clubTeaser.subtitle,
    content: '',
  });

  const hasMainEvent = Boolean(mainEvent);
  const eventDate = mainEvent ? new Date(mainEvent.start_dt) : null;
  const eventEndDate = mainEvent?.end_dt ? new Date(mainEvent.end_dt) : null;
  const heroTitle = hasMainEvent
    ? (mainEvent?.title || heroContent.title || settings?.site_name || t.clubTeaser.title)
    : (heroContent.title || settings?.site_name || t.clubTeaser.title);
  const heroSubtitle = hasMainEvent
    ? (mainEvent?.description || heroContent.subtitle || settings?.description || t.clubTeaser.subtitle)
    : (heroContent.subtitle || settings?.description || t.clubTeaser.subtitle);
  const primaryButtonLabel = heroContent.primary_button_label || (hasMainEvent ? t.hero.ctaEvent : t.hero.ctaDiscover);
  const primaryButtonUrl = heroContent.primary_button_url || (hasMainEvent ? '/event' : '/club/about');
  const secondaryButtonLabel = heroContent.secondary_button_label || (hasMainEvent ? t.hero.ctaSchedule : t.nav.calendar);
  const secondaryButtonUrl = heroContent.secondary_button_url || (hasMainEvent ? '/event#schedule' : '/calendar');

  const countdown = useCountdown(eventDate);
  
  // Format the event date display
  const formatEventDate = () => {
    if (!eventDate) return '';

    const dateLocale = locale === 'de' ? de : locale === 'cz' ? cs : enUS;
    const startFormat = locale === 'en' ? 'MMMM d' : 'd. MMMM';
    const endFormat = locale === 'en' ? 'MMMM d, yyyy' : 'd. MMMM yyyy';
    const singleFormat = locale === 'en' ? 'MMMM d, yyyy' : 'd. MMMM yyyy';
    const startFormatted = format(eventDate, startFormat, { locale: dateLocale });
    
    if (eventEndDate) {
      const endFormatted = format(eventEndDate, endFormat, { locale: dateLocale });
      return `${startFormatted}-${endFormatted}`;
    }
    
    return format(eventDate, singleFormat, { locale: dateLocale });
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
          {isLoading ? (
            <div className="mb-6 inline-flex items-center gap-2 bg-accent px-5 py-2 text-sm font-bold uppercase tracking-wider text-accent-foreground">
              <Calendar className="h-4 w-4" />
              <Skeleton className="h-4 w-32 bg-accent-foreground/20" />
            </div>
          ) : hasMainEvent ? (
            <div className="mb-6 inline-flex items-center gap-2 bg-accent px-5 py-2 text-sm font-bold uppercase tracking-wider text-accent-foreground">
              <Calendar className="h-4 w-4" />
              {formatEventDate()}
            </div>
          ) : null}

          {/* Main Title */}
          {isLoading ? (
            <Skeleton className="h-16 w-3/4 mx-auto mb-6 bg-primary-foreground/10" />
          ) : (
            <h1 className="mb-6 font-display text-5xl font-black uppercase tracking-tight md:text-7xl">
              {heroTitle}
            </h1>
          )}

          <p className="mb-10 text-lg text-primary-foreground/80 md:text-xl">
            {heroSubtitle}
          </p>

          {hasMainEvent && countdown ? (
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
          ) : null}

          {/* CTAs */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <HeroPrimaryButton url={primaryButtonUrl} label={primaryButtonLabel} />
            <HeroSecondaryButton url={secondaryButtonUrl} label={secondaryButtonLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}

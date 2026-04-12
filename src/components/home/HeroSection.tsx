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
const CYCLE_INTERVAL = 8000;

function isExternalUrl(url: string) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(url);
}

function renderHeroCta(
  url: string,
  children: React.ReactNode,
  buttonProps: { size: 'lg'; variant?: 'outline'; className: string },
) {
  if (isExternalUrl(url)) {
    return (
      <Button {...buttonProps} asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>
      </Button>
    );
  }
  return (
    <Button {...buttonProps} asChild>
      <Link to={url}>{children}</Link>
    </Button>
  );
}

function HeroPrimaryButton({ url, label }: { url: string; label: string }) {
  return renderHeroCta(
    url,
    <>{label}<ArrowRight className="ml-2 h-4 w-4" /></>,
    { size: 'lg', className: 'bg-accent px-8 text-base font-bold uppercase tracking-wider text-accent-foreground hover:bg-accent/90' },
  );
}

function HeroSecondaryButton({ url, label }: { url: string; label: string }) {
  return renderHeroCta(url, label, {
    size: 'lg',
    variant: 'outline',
    className: 'border-2 border-white/50 bg-white/10 px-8 text-base font-medium text-white hover:border-white hover:bg-white/20',
  });
}

function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!targetDate) return null;
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;
    if (distance < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  });

  const targetTimestamp = targetDate?.getTime() ?? null;

  useEffect(() => {
    if (targetTimestamp === null) { setTimeLeft(null); return; }
    const calc = () => {
      const now = new Date().getTime();
      const d = targetTimestamp - now;
      if (d < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(d / (1000 * 60 * 60 * 24)),
        hours: Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((d % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((d % (1000 * 60)) / 1000),
      };
    };
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
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

  // CMS image or plain blue
  const cmsImage = heroContent.image_url || null;

  const formatEventDate = () => {
    if (!eventDate) return '';
    const dateLocale = locale === 'de' ? de : locale === 'cz' ? cs : enUS;
    const startFormat = locale === 'en' ? 'MMMM d' : 'd. MMMM';
    const endFormat = locale === 'en' ? 'MMMM d, yyyy' : 'd. MMMM yyyy';
    const singleFormat = locale === 'en' ? 'MMMM d, yyyy' : 'd. MMMM yyyy';
    const startFormatted = format(eventDate, startFormat, { locale: dateLocale });
    if (eventEndDate) {
      return `${startFormatted}–${format(eventEndDate, endFormat, { locale: dateLocale })}`;
    }
    return format(eventDate, singleFormat, { locale: dateLocale });
  };

  return (
    <section className="relative overflow-hidden flex items-center" style={{ minHeight: 'calc(100svh - 4rem)' }}>
      {/* Background: CMS image or classic blue */}
      <div className="absolute inset-0 bg-primary">
        {cmsImage && (
          <>
            <img src={cmsImage} alt="" className="h-full w-full object-cover" width={1920} height={640} />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/50" />
          </>
        )}
        {/* Racing stripe pattern */}
        <div className="absolute inset-0">
          <div className="racing-stripe h-full w-full" />
        </div>
        {/* Animated checkered flag pattern overlay */}
        <div className="absolute inset-0 hero-checkered" />
        {/* Pulsing radial glow */}
        <div className="absolute inset-0 hero-pulse-glow bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.25)_0%,transparent_70%)]" />
      </div>

      {/* Animated speed lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="hero-speed-line absolute top-[20%] left-0 h-[2px] w-[60%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="hero-speed-line-2 absolute top-[50%] left-0 h-[2px] w-[40%] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="hero-speed-line-3 absolute top-[75%] left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* Accent stripe — animated slide-in, hidden on mobile */}
      <div className="absolute -right-20 top-0 hidden h-full w-40 skew-x-[-15deg] bg-accent md:block hero-stripe-slide" />
      <div className="absolute -right-32 top-0 hidden h-full w-16 skew-x-[-15deg] bg-accent/40 md:block hero-stripe-slide" style={{ animationDelay: '0.4s' }} />

      <div className="container relative z-10 py-8 md:py-16">
        <div className="mx-auto max-w-4xl text-center text-white">
          {/* Rev-counter bar accent */}
          <div className="mx-auto mb-6 hidden h-1 max-w-xs overflow-hidden md:block md:mb-8">
            <div className="hero-rev-bar h-full bg-gradient-to-r from-accent via-accent to-destructive" />
          </div>

          {isLoading ? (
            <div className="hero-animate-in mb-4 inline-flex items-center gap-2 bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground md:mb-6 md:px-5 md:py-2 md:text-sm">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <Skeleton className="h-4 w-32 bg-accent-foreground/20" />
            </div>
          ) : hasMainEvent ? (
            <div className="hero-animate-in mb-4 inline-flex items-center gap-2 bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground md:mb-6 md:px-5 md:py-2 md:text-sm">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {formatEventDate()}
            </div>
          ) : null}

          {isLoading ? (
            <Skeleton className="h-16 w-3/4 mx-auto mb-4 bg-white/10 md:mb-6" />
          ) : (
            <h1 className="hero-animate-in-delay-1 mb-4 font-display text-4xl font-black uppercase tracking-tight md:mb-6 md:text-7xl">
              {heroTitle}
            </h1>
          )}

          <p className="hero-animate-in-delay-2 mb-6 text-base text-white/80 md:mb-10 md:text-xl">{heroSubtitle}</p>

          {hasMainEvent && countdown ? (
            <div className="hero-animate-in-delay-3 mb-8 inline-grid grid-cols-4 gap-2 md:mb-12 md:gap-5">
              {[
                { value: countdown.days, label: t.hero.days },
                { value: countdown.hours, label: t.hero.hours },
                { value: countdown.minutes, label: t.hero.minutes },
                { value: countdown.seconds, label: t.hero.seconds },
              ].map((item) => (
                <div key={item.label} className="border border-white/20 bg-white/10 px-3 py-2.5 md:px-8 md:py-5 transition-colors duration-300 hover:bg-white/20 hover:border-accent/50">
                  <div className="font-display text-2xl font-black md:text-5xl">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/60 md:mt-1 md:text-xs">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="hero-animate-in-delay-4 flex flex-col justify-center gap-3 sm:flex-row md:gap-4">
            <HeroPrimaryButton url={primaryButtonUrl} label={primaryButtonLabel} />
            <HeroSecondaryButton url={secondaryButtonUrl} label={secondaryButtonLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}

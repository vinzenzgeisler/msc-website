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

// Module-level flag: true on fresh page load, false after first HeroSection mount
let heroAnimatedThisSession = false;

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
  const [shouldAnimate] = useState(() => {
    if (heroAnimatedThisSession) return false;
    heroAnimatedThisSession = true;
    return true;
  });
  const [scrollY, setScrollY] = useState(0);
  const { data: mainEvent, isLoading } = useMainEvent();
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [typingComplete, setTypingComplete] = useState(!shouldAnimate);
  const [showCursor, setShowCursor] = useState(shouldAnimate);

  // Parallax scroll
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
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
  const primaryButtonUrl = heroContent.primary_button_url || (hasMainEvent ? '/old' : '/club/about');
  const secondaryButtonLabel = heroContent.secondary_button_label || (hasMainEvent ? t.hero.ctaDiscover: t.nav.calendar);
  const secondaryButtonUrl = heroContent.secondary_button_url || (hasMainEvent ? '/old#schedule' : '/calendar');

  // JS Typewriter effect for smooth multi-line wrapping
  useEffect(() => {
    if (!shouldAnimate || !hasMainEvent) {
      setDisplayedTitle(heroTitle);
      setTypingComplete(true);
      setShowCursor(false);
      return;
    }

    let isMounted = true;
    setDisplayedTitle('');
    setTypingComplete(false);
    setShowCursor(true);

    const delayTimer = setTimeout(() => {
      let i = 0;
      const chars = heroTitle.split('');
      const intervalTime = 1500 / Math.max(chars.length, 1);

      const typeTimer = setInterval(() => {
        if (!isMounted) return;
        i++;
        setDisplayedTitle(chars.slice(0, i).join(''));
        if (i >= chars.length) {
          clearInterval(typeTimer);
          setTypingComplete(true);
          
          // Cursor nach 3 Sekunden (4 x 0.75s Blinken) ausblenden
          setTimeout(() => {
            if (isMounted) setShowCursor(false);
          }, 3000);
        }
      }, intervalTime);

      return () => clearInterval(typeTimer);
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(delayTimer);
    };
  }, [heroTitle, shouldAnimate, hasMainEvent]);

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
      return `${startFormatted} – ${format(eventEndDate, endFormat, { locale: dateLocale })}`;
    }
    return format(eventDate, singleFormat, { locale: dateLocale });
  };

  const a = (cls: string) => shouldAnimate ? cls : '';

  return (
    <section className="relative overflow-hidden flex items-center min-h-[calc(100svh-4rem)] md:min-h-[70vh]">
      {/* Background: CMS image or classic blue with parallax */}
      <div
        className="absolute inset-0 bg-primary"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
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
      </div>

      {/* Accent diagonal wedge */}
      <svg className={`absolute right-0 top-0 hidden h-full md:block ${a('hero-animate-stripe')}`} preserveAspectRatio="none" viewBox="0 0 100 100" style={{ height: '100%', width: '12vw', maxWidth: '200px' }}>
        <polygon points="100,0 100,100 0,100" fill="hsl(48,100%,50%)" />
      </svg>

      <div className="container relative z-10 py-8 md:py-16">
        <div className="mx-auto max-w-4xl text-center text-white">
          {isLoading ? (
            <div className={`mb-4 inline-flex items-center gap-2 bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground md:mb-6 md:px-5 md:py-2 md:text-sm ${a('hero-animate-badge')}`}>
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <Skeleton className="h-4 w-32 bg-accent-foreground/20" />
            </div>
          ) : hasMainEvent ? (
            <div className={`mb-4 inline-flex items-center gap-2 bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground md:mb-6 md:px-5 md:py-2 md:text-sm ${a('hero-animate-badge')}`}>
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
              {formatEventDate()}
            </div>
          ) : null}

          {isLoading ? (
            <Skeleton className="h-16 w-3/4 mx-auto mb-4 bg-white/10 md:mb-6" />
          ) : shouldAnimate && hasMainEvent ? (
            <h1 className="mb-4 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight md:mb-6 md:text-7xl hero-animate-title">
            {displayedTitle}
            <span
              className={`inline-block ${showCursor ? 'border-r-[0.15em] border-accent' : ''}`}
              style={{
                animation: typingComplete && showCursor ? 'hero-blink-caret 0.75s step-end 4' : 'none',
              }}
            >
              &#8203;
              </span>
            </h1>
          ) : (
            <h1 className={`mb-4 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight md:mb-6 md:text-7xl ${a('hero-animate-title')}`}>
              {heroTitle}
            </h1>
          )}

          <p className={`mb-6 text-base text-white/80 md:mb-10 md:text-xl ${a('hero-animate-subtitle')}`}>{heroSubtitle}</p>

          {hasMainEvent && countdown ? (
            <div className={`mb-8 inline-grid grid-cols-4 gap-2 md:mb-12 md:gap-5 ${a('hero-animate-countdown')}`}>
              {[
                { value: countdown.days, label: t.hero.days },
                { value: countdown.hours, label: t.hero.hours },
                { value: countdown.minutes, label: t.hero.minutes },
                { value: countdown.seconds, label: t.hero.seconds },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 md:px-8 md:py-5">
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

          <div className={`flex flex-col justify-center gap-3 sm:flex-row md:gap-4 ${a('hero-animate-cta')}`}>
            <HeroPrimaryButton url={primaryButtonUrl} label={primaryButtonLabel} />
            <HeroSecondaryButton url={secondaryButtonUrl} label={secondaryButtonLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}

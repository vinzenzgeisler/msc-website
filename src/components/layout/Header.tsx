import { Link, useLocation } from 'react-router-dom';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Menu, X, ChevronDown, ChevronRight, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/translations';

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'cz', label: 'Čeština', flag: '🇨🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

interface SliderState {
  left: number;
  width: number;
  visible: boolean;
}

const emptySlider: SliderState = { left: 0, width: 0, visible: false };
let persistedDesktopSlider: SliderState | null = null;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [slider, setSlider] = useState<SliderState>(() => persistedDesktopSlider ?? emptySlider);
  const [sliderReady, setSliderReady] = useState(false);
  const startsFromPreviousPage = useRef(Boolean(persistedDesktopSlider?.visible));
  const desktopNavRef = useRef<HTMLElement>(null);
  const { locale, setLocale, t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const { data: settings } = useSettings();
  const location = useLocation();

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navItems = [
    { path: '/', label: t.nav.home },
    { path: '/event', label: t.nav.event },
    { path: '/calendar', label: t.nav.calendar },
    { path: '/news', label: t.nav.news },
    {
      label: t.nav.club,
      children: [
        { path: '/club/about', label: t.nav.about },
        { path: '/club/board', label: t.nav.board },
        { path: '/club/history', label: t.nav.history },
        { path: '/club/membership', label: t.nav.membership },
        { path: '/club/touring', label: t.nav.touring },
        { path: '/club/motocross', label: t.nav.motocross },
        { path: '/club/trial', label: t.nav.trial },
      ],
    },
    {
      label: t.nav.partners,
      children: [
        { path: '/partners/sponsors', label: t.nav.sponsors },
        { path: '/partners/clubs', label: t.nav.partnerClubs },
      ],
    },
    { path: '/contact', label: t.nav.contact },
  ];

  const updateSlider = useCallback(() => {
    const nav = desktopNavRef.current;
    const label = nav?.querySelector<HTMLElement>('[data-nav-active="true"] [data-nav-label]');

    if (!nav || !label) {
      setSlider((current) => {
        const next = current.visible ? { ...current, visible: false } : current;
        persistedDesktopSlider = next;
        return next;
      });
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const next = {
      left: labelRect.left - navRect.left,
      width: labelRect.width,
      visible: true,
    };
    persistedDesktopSlider = next;

    setSlider((current) =>
      Math.abs(current.left - next.left) < 0.5 &&
      Math.abs(current.width - next.width) < 0.5 &&
      current.visible
        ? current
        : next
    );
  }, []);

  useLayoutEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;
    let readyFrame = 0;
    let targetFrame = 0;

    const connectMeasurements = () => {
      if (cancelled) return;
      const nav = desktopNavRef.current;
      observer = nav && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateSlider)
        : null;
      if (nav) observer?.observe(nav);
      window.addEventListener('resize', updateSlider);
      void document.fonts?.ready.then(() => {
        if (!cancelled) updateSlider();
      });
    };

    if (startsFromPreviousPage.current) {
      readyFrame = window.requestAnimationFrame(() => {
        setSliderReady(true);
        targetFrame = window.requestAnimationFrame(() => {
          updateSlider();
          connectMeasurements();
        });
      });
    } else {
      updateSlider();
      connectMeasurements();
      readyFrame = window.requestAnimationFrame(() => setSliderReady(true));
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(readyFrame);
      window.cancelAnimationFrame(targetFrame);
      window.removeEventListener('resize', updateSlider);
      observer?.disconnect();
    };
  }, [locale, location.pathname, updateSlider]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex min-w-0 shrink items-center gap-2">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.logo_alt || settings.site_short_name || settings.site_name || 'Logo'}
              className="h-12 w-12 shrink-0 object-contain"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
              {(settings?.site_short_name || 'MSC').slice(0, 3)}
            </div>
          )}
          <span className="hidden whitespace-nowrap font-heading font-bold uppercase leading-none tracking-wider text-foreground [@media(min-width:1700px)]:inline-block">
            {settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.'}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav ref={desktopNavRef} className="relative hidden items-center gap-1 xl:ml-auto xl:flex">
          {navItems.map((item) => {
            const itemActive = item.children
              ? item.children.some((child) => isActive(child.path))
              : isActive(item.path);

            return item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    data-nav-active={itemActive}
                    aria-current={itemActive ? 'page' : undefined}
                    className="gap-1 hover:bg-muted hover:text-foreground"
                  >
                    <span data-nav-label>{item.label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.path} asChild>
                      <Link
                        to={child.path}
                        className={cn(
                          isActive(child.path) && 'font-semibold underline decoration-accent decoration-[3px] underline-offset-4'
                        )}
                      >
                        {child.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  data-nav-active={itemActive}
                  aria-current={itemActive ? 'page' : undefined}
                  className="hover:bg-muted hover:text-foreground"
                >
                  <span data-nav-label>{item.label}</span>
                </Button>
              </Link>
            );
          })}
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute bottom-1.5 left-0 z-10 h-[3px] w-px origin-left bg-accent will-change-transform',
              sliderReady && 'transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none',
              slider.visible ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              transform: `translate3d(${slider.left}px, 0, 0) scaleX(${slider.width})`,
            }}
          />
        </nav>

        {/* Right Side: Language Switcher & Theme Toggle */}
        <div className="flex items-center gap-2 xl:ml-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 w-14 gap-1 p-0">
                <span>{currentLang.code.toUpperCase()}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={cn(locale === lang.code && 'bg-accent')}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            className="h-10 w-14 p-0"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background xl:hidden">
          <nav className="container py-4">
            <ul className="space-y-1">
              {navItems.map((item) =>
                item.children ? (
                  <MobileSubmenu
                    key={item.label}
                    label={item.label}
                    children={item.children}
                    isActive={isActive}
                    onNavigate={() => setIsMenuOpen(false)}
                  />
                ) : (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        'block px-3 py-2 text-sm font-medium transition-colors [-webkit-tap-highlight-color:transparent] hover:text-foreground active:bg-transparent focus-visible:outline-none focus-visible:underline focus-visible:decoration-accent focus-visible:decoration-[3px] focus-visible:underline-offset-4',
                        isActive(item.path) && 'underline decoration-accent decoration-[3px] underline-offset-4'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

// Collapsible submenu component for mobile
function MobileSubmenu({
  label,
  children,
  isActive,
  onNavigate,
}: {
  label: string;
  children: { path: string; label: string }[];
  isActive: (path: string) => boolean;
  onNavigate: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveChild = children.some((child) => isActive(child.path));

  return (
    <li>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'flex w-full items-center justify-between px-3 py-2 text-sm font-medium transition-colors [-webkit-tap-highlight-color:transparent] hover:text-foreground active:bg-transparent focus-visible:outline-none focus-visible:underline focus-visible:decoration-accent focus-visible:decoration-[3px] focus-visible:underline-offset-4',
              hasActiveChild && 'font-semibold underline decoration-accent decoration-[3px] underline-offset-4'
            )}
          >
            {label}
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isOpen && 'rotate-90'
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 ml-3 space-y-1 border-l-2 border-border pl-3">
          {children.map((child) => (
            <Link
              key={child.path}
              to={child.path}
              onClick={onNavigate}
              className={cn(
                'block px-3 py-2 text-sm transition-colors [-webkit-tap-highlight-color:transparent] hover:text-foreground active:bg-transparent focus-visible:outline-none focus-visible:underline focus-visible:decoration-accent focus-visible:decoration-[3px] focus-visible:underline-offset-4',
                isActive(child.path) && 'font-medium underline decoration-accent decoration-[3px] underline-offset-4'
              )}
            >
              {child.label}
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

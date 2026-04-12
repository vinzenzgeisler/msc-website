import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
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
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const { data: settings } = useSettings();
  const location = useLocation();

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const isActive = (path: string) => location.pathname === path;

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
      ],
    },
    {
      label: t.nav.sections,
      children: [
        { path: '/sections/touring', label: t.nav.touring },
        { path: '/sections/motocross', label: t.nav.motocross },
        { path: '/sections/trial', label: t.nav.trial },
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.logo_alt || settings.site_short_name || settings.site_name || 'Logo'}
              className="h-12 w-12 object-contain"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
              {(settings?.site_short_name || 'MSC').slice(0, 3)}
            </div>
          )}
          <span className="hidden font-heading font-bold text-foreground uppercase tracking-wider xl:inline-block">
            {settings?.site_name || 'MSC Oberlausitzer Dreiländereck'}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) =>
            item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-1">
                    {item.label}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.path} asChild>
                      <Link
                        to={child.path}
                        className={cn(
                          isActive(child.path) && 'bg-accent'
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
                  className={cn(
                    isActive(item.path) &&
                      'bg-accent text-accent-foreground'
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            )
          )}
        </nav>

        {/* Right Side: Language Switcher & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
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
            size="icon"
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
                        'block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                        isActive(item.path) && 'bg-accent'
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
              'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
              hasActiveChild && 'text-primary'
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
                'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                isActive(child.path) && 'bg-accent font-medium'
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

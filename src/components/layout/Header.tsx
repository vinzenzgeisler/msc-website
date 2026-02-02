import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
            MSC
          </div>
          <span className="hidden font-bold text-foreground sm:inline-block">
            MSC Oberlausitzer Dreiländereck
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
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
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
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
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container py-4">
            <ul className="space-y-2">
              {navItems.map((item) =>
                item.children ? (
                  <li key={item.label}>
                    <div className="mb-1 px-3 text-sm font-semibold text-muted-foreground">
                      {item.label}
                    </div>
                    <ul className="ml-4 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <Link
                            to={child.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                              isActive(child.path) && 'bg-accent font-medium'
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
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

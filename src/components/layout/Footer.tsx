import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const t = useTranslation();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/50">
      {/* Main Footer Content */}
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Club Info */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
                MSC
              </div>
              <span className="font-bold">MSC Oberlausitzer Dreiländereck e.V.</span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Motorsport mit Leidenschaft seit der Gründung. Erlebe Motorradtouristik, Motocross, Trial und den legendären Demolauf im Dreiländereck.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold">{t.nav.club}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/club/about" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link to="/club/board" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.board}
                </Link>
              </li>
              <li>
                <Link to="/club/history" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.history}
                </Link>
              </li>
              <li>
                <Link to="/club/membership" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.membership}
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Links */}
          <div>
            <h3 className="mb-4 font-semibold">{t.nav.event}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/event" className="text-muted-foreground transition-colors hover:text-foreground">
                  Oberlausitzer Dreieck
                </Link>
              </li>
              <li>
                <Link to="/event#schedule" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.event.schedule}
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.calendar}
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.news}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold">{t.nav.contact}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  MSC Oberlausitzer Dreiländereck e.V.
                  <br />
                  02797 Oybin
                </span>
              </li>
              <li>
                <a
                  href="mailto:info@msc-oberlausitzer-dreilaendereck.de"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  info@msc-oberlausitzer-dreilaendereck.de
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted">
        <div className="container flex flex-col items-center justify-between gap-4 py-4 text-sm text-muted-foreground sm:flex-row">
          <p>© {currentYear} MSC Oberlausitzer Dreiländereck e.V. {t.footer.rights}</p>
          <div className="flex gap-4">
            <Link to="/imprint" className="transition-colors hover:text-foreground">
              {t.nav.imprint}
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              {t.nav.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

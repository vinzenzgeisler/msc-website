import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/LanguageContext';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export function Footer() {
  const t = useTranslation();
  const { data: settings } = useSettings();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/50">
      {/* Main Footer Content */}
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Club Info */}
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.logo_alt || settings.site_short_name || settings.site_name || 'Logo'}
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center bg-primary text-primary-foreground font-bold">
                  {(settings?.site_short_name || 'MSC').slice(0, 3)}
                </div>
              )}
              <span className="font-heading font-bold uppercase tracking-wider">{settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.'}</span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {settings?.description || 'Motorsport mit Leidenschaft seit der Gründung.'}
            </p>
            <div className="flex gap-3">
              <a
                href={settings?.facebook_url || 'https://www.facebook.com/'}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={settings?.instagram_url || 'https://www.instagram.com/'}
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
                <Link to="/old" className="text-muted-foreground transition-colors hover:text-foreground">
                  Oberlausitzer Dreieck
                </Link>
              </li>
              <li>
                <Link to="/old#schedule" className="text-muted-foreground transition-colors hover:text-foreground">
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
          <div className="col-span-2 lg:col-span-1">
            <h3 className="mb-4 font-semibold">{t.nav.contact}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.'}
                  <br />
                  {settings?.address || '02797 Oybin'}
                </span>
              </li>
              {settings?.contact_phone && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{settings.contact_phone}</span>
                </li>
              )}
              <li>
                <a
                  href={`mailto:${settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.eu'}`}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {settings?.contact_email || 'info@msc-oberlausitzer-dreilaendereck.eu'}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-muted">
        <div className="container flex flex-col items-center justify-between gap-4 py-4 text-sm text-muted-foreground sm:flex-row">
          <p>© {currentYear} {settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.'} {t.footer.rights}</p>
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

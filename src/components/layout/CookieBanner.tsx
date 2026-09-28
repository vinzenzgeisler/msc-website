import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { useConsent } from '@/contexts/ConsentContext';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/i18n/locale-utils';

export function CookieBanner() {
  const { locale } = useLanguage();
  const {
    preferences,
    isBannerVisible,
    isPreferencesOpen,
    acceptNecessaryOnly,
    acceptAll,
    savePreferences,
    openPreferences,
    closePreferences,
  } = useConsent();

  const [statisticsEnabled, setStatisticsEnabled] = useState(preferences.statistics);
  const [externalMediaEnabled, setExternalMediaEnabled] = useState(preferences.externalMedia);
  const externalMediaCopy = localize(locale, {
    de: { title: 'Externe Medien', text: 'Lädt eingebettete Videos von YouTube. Dabei können Daten an Google übertragen werden.' },
    en: { title: 'External media', text: 'Loads embedded videos from YouTube. Data may be transferred to Google.' },
    cz: { title: 'Externí média', text: 'Načítá vložená videa z YouTube. Data mohou být předána společnosti Google.' },
    pl: { title: 'Media zewnętrzne', text: 'Wczytuje osadzone filmy z YouTube. Dane mogą zostać przekazane firmie Google.' },
  });

  useEffect(() => {
    setStatisticsEnabled(preferences.statistics);
    setExternalMediaEnabled(preferences.externalMedia);
  }, [preferences.externalMedia, preferences.statistics, isPreferencesOpen]);

  return (
    <>
      {isBannerVisible ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 shadow-lg md:p-6">
          <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 text-sm text-muted-foreground">
              Wir verwenden lokale Schriftarten und keine externen Google-Fonts-Requests. Optionale Statistik
              und eingebettete externe Medien werden nur nach deiner Zustimmung aktiviert.{' '}
              <Link to="/privacy" className="text-primary underline hover:no-underline">
                Datenschutzerklärung
              </Link>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={openPreferences}>
                Einstellungen
              </Button>
              <Button variant="outline" size="sm" onClick={acceptNecessaryOnly}>
                Nur notwendige
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Alle erlauben
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={isPreferencesOpen} onOpenChange={(open) => (open ? openPreferences() : closePreferences())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Datenschutz-Einstellungen</DialogTitle>
            <DialogDescription>
              Notwendige Speicherungen sind immer aktiv. Statistik und externe Medien werden nur mit deiner
              Zustimmung geladen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Notwendig</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Speichert deine Sprache und deine Datenschutzentscheidung. Diese Einstellung kann nicht deaktiviert
                    werden.
                  </p>
                </div>
                <Switch checked disabled aria-label="Notwendige Speicherungen" />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Statistik</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Aktiviert Google Analytics zur Messung von Seitenaufrufen und wichtigen Vereinsaktionen wie
                    Kontakt, Event-Anmeldung, Sponsor-Klicks und Downloads.
                  </p>
                </div>
                <Switch
                  checked={statisticsEnabled}
                  onCheckedChange={setStatisticsEnabled}
                  aria-label="Statistik erlauben"
                />
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{externalMediaCopy.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {externalMediaCopy.text}
                  </p>
                </div>
                <Switch
                  checked={externalMediaEnabled}
                  onCheckedChange={setExternalMediaEnabled}
                  aria-label={externalMediaCopy.title}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={acceptNecessaryOnly}>
              Nur notwendige
            </Button>
            <Button
              onClick={() =>
                savePreferences({
                  necessary: true,
                  statistics: statisticsEnabled,
                  externalMedia: externalMediaEnabled,
                })
              }
            >
              Auswahl speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

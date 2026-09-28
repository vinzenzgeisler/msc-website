import { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useConsent } from '@/contexts/ConsentContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { localize } from '@/i18n/locale-utils';

const YOUTUBE_URL = 'https://youtu.be/PLvxsLHZ4nk';
const YOUTUBE_EMBED_URL = 'https://www.youtube-nocookie.com/embed/PLvxsLHZ4nk?autoplay=1&rel=0';

interface AftermovieButtonProps {
  className?: string;
  label?: string;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
}

export function AftermovieButton({
  className,
  label,
  size = 'lg',
  variant = 'default',
}: AftermovieButtonProps) {
  const { locale } = useLanguage();
  const { preferences, savePreferences } = useConsent();
  const [open, setOpen] = useState(false);
  const copy = localize(locale, {
    de: {
      button: 'Aftermovie ansehen',
      title: 'Aftermovie · 12. Oberlausitzer Dreieck',
      description: 'Das vollständige Aftermovie mit Ton auf YouTube ansehen.',
      consentTitle: 'YouTube-Video laden',
      consentText: 'Erst nach deiner Zustimmung wird eine Verbindung zu YouTube hergestellt. Dabei können Daten an Google übertragen werden.',
      consentButton: 'Externe Medien erlauben & Video starten',
      external: 'Auf YouTube öffnen',
    },
    en: {
      button: 'Watch aftermovie',
      title: 'Aftermovie · 12th Oberlausitzer Dreieck',
      description: 'Watch the full aftermovie with sound on YouTube.',
      consentTitle: 'Load YouTube video',
      consentText: 'A connection to YouTube is made only after you consent. Data may then be transferred to Google.',
      consentButton: 'Allow external media & start video',
      external: 'Open on YouTube',
    },
    cz: {
      button: 'Přehrát aftermovie',
      title: 'Aftermovie · 12. Oberlausitzer Dreieck',
      description: 'Podívejte se na celé aftermovie se zvukem na YouTube.',
      consentTitle: 'Načíst video z YouTube',
      consentText: 'Připojení k YouTube bude navázáno až po vašem souhlasu. Data mohou být předána společnosti Google.',
      consentButton: 'Povolit externí média a spustit video',
      external: 'Otevřít na YouTube',
    },
    pl: {
      button: 'Obejrzyj aftermovie',
      title: 'Aftermovie · 12. Oberlausitzer Dreieck',
      description: 'Obejrzyj pełny film z dźwiękiem w serwisie YouTube.',
      consentTitle: 'Wczytaj film z YouTube',
      consentText: 'Połączenie z YouTube zostanie nawiązane dopiero po wyrażeniu zgody. Dane mogą zostać przekazane firmie Google.',
      consentButton: 'Zezwól na media zewnętrzne i uruchom film',
      external: 'Otwórz w YouTube',
    },
  });

  const allowExternalMedia = () => {
    savePreferences({ ...preferences, externalMedia: true });
  };

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Play className="h-4 w-4 fill-current" />
        {label || copy.button}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-6xl border-white/10 bg-black p-2 text-white sm:p-3">
          <DialogHeader className="sr-only">
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video overflow-hidden bg-slate-950">
            {preferences.externalMedia ? (
              <iframe
                src={YOUTUBE_EMBED_URL}
                title={copy.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src="/media/aftermovie-2026-poster.webp"
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
                <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
                  <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground shadow-xl">
                    <Play className="h-6 w-6 fill-current" />
                  </span>
                  <h2 className="text-xl font-black sm:text-3xl">{copy.consentTitle}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                    {copy.consentText}
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Button type="button" onClick={allowExternalMedia}>
                      {copy.consentButton}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/40 bg-black/20 text-white hover:bg-white hover:text-black"
                      asChild
                    >
                      <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
                        {copy.external} <ExternalLink />
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

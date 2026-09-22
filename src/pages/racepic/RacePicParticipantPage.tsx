import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Download, Loader2, ShoppingBag } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useRacePicCart } from '@/integrations/racepic/cart';
import {
  fetchParticipantGallery,
  requestDownload,
  toCdnUrl,
  type DownloadVariant,
  type RacePicImage,
  type RacePicParticipantGallery
} from '@/integrations/racepic/publicClient';

/**
 * Teilnehmer-Galerie mit Lightbox (Paket 8), siehe docs/memory-bank/racepic-architecture.md
 * Abschnitt B/H. Bewusste Abweichung vom Architektur-Vorschlag "PhotoSwipe" (offener Punkt aus
 * Paket 2): eine eigene, auf dem bestehenden Dialog-Lightbox-Muster
 * (`components/sections/ImageGallerySection.tsx`) basierende Lightbox statt einer neuen
 * Abhängigkeit - konsistent mit dem bereits im Code vorhandenen Muster.
 */
export default function RacePicParticipantPage() {
  const { eventSlug = '', participantKey = '' } = useParams<{ eventSlug: string; participantKey: string }>();
  const [gallery, setGallery] = useState<RacePicParticipantGallery | null>(null);
  const [error, setError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const cart = useRacePicCart();

  useEffect(() => {
    fetchParticipantGallery(eventSlug, participantKey)
      .then(setGallery)
      .catch(() => setError(true));
  }, [eventSlug, participantKey]);

  const images = gallery?.images ?? [];
  const showPrev = () => setSelectedIndex((index) => (index === null ? null : (index - 1 + images.length) % images.length));
  const showNext = () => setSelectedIndex((index) => (index === null ? null : (index + 1) % images.length));

  return (
    <MainLayout
      title={gallery ? `RacePic – #${gallery.participant.startNumber} ${gallery.participant.displayName}` : 'RacePic'}
      description="Alle Bilder dieses Fahrzeugs von unseren Fotograf:innen an einem Ort."
      canonicalPath={`/racepic/${eventSlug}/${participantKey}`}
    >
      <section className="container max-w-5xl py-16">
        <p className="text-sm text-muted-foreground">
          <Link to="/racepic" className="hover:underline">
            RacePic
          </Link>{' '}
          /{' '}
          <Link to={`/racepic?event=${eventSlug}`} className="hover:underline">
            {eventSlug}
          </Link>
        </p>

        {!gallery && !error && <Loader2 className="mt-8 h-8 w-8 animate-spin text-accent" />}
        {error && <p className="mt-6 text-muted-foreground">Diese Bildersammlung wurde nicht gefunden.</p>}

        {gallery && (
          <>
            <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight">
              #{gallery.participant.startNumber} {gallery.participant.displayName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {gallery.participant.make} {gallery.participant.model} · {gallery.participant.className}
            </p>
            <p className="mt-4 text-sm font-medium">{images.length} Bild(er) gefunden</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((image, index) => {
                const inCart = cart.has(image.imageId);
                return (
                  <div key={image.imageId} className="group relative overflow-hidden rounded-lg border bg-muted">
                    <button type="button" onClick={() => setSelectedIndex(index)} className="block w-full">
                      <img
                        src={toCdnUrl(image.thumbUrl)}
                        alt=""
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        inCart ? cart.removeItem(image.imageId) : cart.addItem({ imageId: image.imageId, eventSlug, thumbUrl: image.thumbUrl })
                      }
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow"
                      aria-label={inCart ? 'Aus Warenkorb entfernen' : 'Zum Warenkorb hinzufügen'}
                    >
                      {inCart ? <Check className="h-4 w-4 text-primary" /> : <ShoppingBag className="h-4 w-4 text-foreground" />}
                    </button>
                  </div>
                );
              })}
              {images.length === 0 && <p className="text-muted-foreground">Noch keine Bilder für dieses Fahrzeug.</p>}
            </div>

            <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
              <DialogContent className="max-w-6xl border-none bg-transparent p-0 shadow-none">
                {selectedIndex !== null && images[selectedIndex] && (
                  <Lightbox image={images[selectedIndex]} onPrev={showPrev} onNext={showNext} hasMultiple={images.length > 1} />
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </section>
    </MainLayout>
  );
}

function Lightbox({ image, onPrev, onNext, hasMultiple }: { image: RacePicImage; onPrev: () => void; onNext: () => void; hasMultiple: boolean }) {
  const [downloading, setDownloading] = useState<DownloadVariant | null>(null);
  const [downloadError, setDownloadError] = useState('');

  const handleDownload = async (variant: DownloadVariant) => {
    setDownloading(variant);
    setDownloadError('');
    try {
      const result = await requestDownload(image.imageId, variant);
      window.location.assign(result.url);
    } catch {
      setDownloadError('Download fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="relative">
      <img src={toCdnUrl(image.previewUrl)} alt="" className="max-h-[75vh] w-full object-contain" />
      {hasMultiple && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 border-white/30 bg-black/60 text-white hover:bg-black/80"
            onClick={onPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 border-white/30 bg-black/60 text-white hover:bg-black/80"
            onClick={onNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      <div className="mt-3 flex flex-col items-center gap-2 text-center text-sm text-white/90">
        <p>
          Foto:{' '}
          {image.photographer.slug ? (
            <Link to={`/racepic/fotografen/${image.photographer.slug}`} className="underline hover:no-underline">
              {image.photographer.displayName}
            </Link>
          ) : (
            image.photographer.displayName
          )}{' '}
          · Lizenz: {image.license.title.de ?? image.license.code}
          {image.license.attributionRequired && ' · Namensnennung erforderlich'}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {(['small', 'medium', 'large', 'original'] as const).map((variant) => (
            <Button key={variant} size="sm" variant="outline" disabled={downloading !== null} onClick={() => handleDownload(variant)}>
              {downloading === variant ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="mr-1 h-4 w-4" />}
              {variant === 'small' && 'Klein'}
              {variant === 'medium' && 'Mittel'}
              {variant === 'large' && 'Groß'}
              {variant === 'original' && 'Original'}
            </Button>
          ))}
        </div>
        {downloadError && <p className="text-red-300">{downloadError}</p>}
      </div>
    </div>
  );
}

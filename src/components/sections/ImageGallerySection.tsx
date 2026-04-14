import { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useMediaAlbums, useMediaFiles } from '@/hooks/useMedia';
import type { MediaFile } from '@/integrations/pocketbase/client';

interface ImageGallerySectionProps {
  albumSlug: string;
  title?: string;
  fallbackText?: string;
  className?: string;
}

export function ImageGallerySection({
  albumSlug,
  title = 'Galerie',
  fallbackText = 'Noch keine Bilder vorhanden.',
  className = '',
}: ImageGallerySectionProps) {
  const { data: albums } = useMediaAlbums();
  const album = albums?.find((a) => a.slug === albumSlug);
  const { data: files, isLoading } = useMediaFiles(album?.id);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const showPrev = () => {
    if (!files || selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + files.length) % files.length);
  };
  const showNext = () => {
    if (!files || selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % files.length);
  };

  return (
    <section className={`border-t border-border py-16 ${className}`}>
      <div className="container">
        <h2 className="mb-8 text-2xl font-black uppercase tracking-tight flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          {title}
        </h2>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
            ))}
          </div>
        ) : files && files.length > 0 ? (
          <div className="space-y-6">
            <Carousel opts={{ align: 'start', loop: files.length > 1 }} className="w-full px-12">
              <CarouselContent className="-ml-4">
                {files.map((file, index) => (
                  <CarouselItem key={file.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className="group block w-full overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={file.file_url}
                          alt={file.alt_text || title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {files.length > 1 && (
                <>
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </>
              )}
            </Carousel>

            {/* Lightbox */}
            <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
              <DialogContent className="max-w-6xl border-none bg-transparent p-0 shadow-none">
                {selectedIndex !== null && files[selectedIndex] ? (
                  <div className="relative">
                    <img
                      src={files[selectedIndex].file_url}
                      alt={files[selectedIndex].alt_text || title}
                      className="max-h-[82vh] w-full object-contain"
                    />
                    {files.length > 1 && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 border-white/30 bg-black/60 text-white hover:bg-black/80"
                          onClick={showPrev}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 border-white/30 bg-black/60 text-white hover:bg-black/80"
                          onClick={showNext}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                    {files[selectedIndex].alt_text && (
                      <p className="mt-3 text-center text-sm text-white/80">
                        {files[selectedIndex].alt_text}
                      </p>
                    )}
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <p className="text-muted-foreground">{fallbackText}</p>
        )}
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Check, Download, Loader2, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRacePicCart } from '@/integrations/racepic/cart';
import { fetchImageDetail, requestDownload, toCdnUrl, type RacePicImageDetail } from '@/integrations/racepic/publicClient';
import { useRacePicText } from '@/i18n/racepic';
import { useLanguage } from '@/i18n/LanguageContext';

type ImageRef = { eventSlug: string; imageId: string };

export function RacePicImageDialog({ selected, onSelect, onClose }: {
  selected: ImageRef | null;
  onSelect: (image: ImageRef) => void;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<RacePicImageDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cart = useRacePicCart();
  const t = useRacePicText();
  const { locale } = useLanguage();

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    let current = true;
    setLoading(true);
    setError(false);
    setDetail(null);
    fetchImageDetail(selected.eventSlug, selected.imageId)
      .then((value) => { if (current) setDetail(value); })
      .catch(() => { if (current) setError(true); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [selected?.eventSlug, selected?.imageId]);

  const download = async () => {
    if (!detail) return;
    setDownloading(true);
    try {
      const result = await requestDownload(detail.image.imageId, 'original');
      window.location.assign(result.url);
    } catch { setError(true); }
    finally { setDownloading(false); }
  };

  const image = detail?.image;
  return (
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-h-[95vh] max-w-6xl overflow-y-auto p-0 sm:rounded-2xl"
        overlayClassName="bg-background/40"
      >
        {loading && <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin" /></div>}
        {error && <div className="p-10 text-center text-muted-foreground">{t.imageLoadError}</div>}
        {detail && image && (
          <>
            <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="flex min-h-72 items-center justify-center bg-muted p-3 sm:p-6">
                <img src={toCdnUrl(image.previewUrl)} alt={image.title || detail.eventTitle} className="max-h-[70vh] w-full object-contain" />
              </div>
              <aside className="space-y-5 p-5 sm:p-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{detail.eventTitle}</p>
                  <h2 className="mt-2 font-heading text-2xl font-bold">{image.title || t.photoTitle}</h2>
                  {image.description && <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{image.description}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => cart.toggleSaved(image.imageId)} aria-pressed={cart.isSaved(image.imageId)}>
                    <Bookmark className="mr-2 h-4 w-4" fill={cart.isSaved(image.imageId) ? 'currentColor' : 'none'} />
                    {cart.isSaved(image.imageId) ? t.saved : t.save}
                  </Button>
                  <Button variant="outline" onClick={() => cart.has(image.imageId) ? cart.removeItem(image.imageId) : cart.addItem({ imageId: image.imageId, eventSlug: detail.eventSlug, thumbUrl: image.thumbUrl })}>
                    {cart.has(image.imageId) ? <Check className="mr-2 h-4 w-4" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
                    {cart.has(image.imageId) ? t.inCart : t.addToCart}
                  </Button>
                </div>
                <Button className="w-full" disabled={downloading} onClick={download}>
                  {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {t.freeDownload}
                </Button>
                <dl className="space-y-3 border-t pt-4 text-sm">
                  <div><dt className="text-muted-foreground">{t.photographer}</dt><dd className="font-medium">{image.photographer.slug ? <Link className="hover:underline" to={`/racepic/fotografen/${image.photographer.slug}`} onClick={onClose}>{image.photographer.displayName}</Link> : image.photographer.displayName}</dd></div>
                  <div><dt className="text-muted-foreground">{t.license}</dt><dd>{image.license.title[locale] || image.license.title.de || image.license.code}{image.license.attributionRequired ? ` · ${t.attribution}` : ''}</dd></div>
                  {image.camera && (image.camera.make || image.camera.model) && <div><dt className="text-muted-foreground">{t.camera}</dt><dd>{[image.camera.make, image.camera.model].filter(Boolean).join(' ')}</dd></div>}
                  {image.capturedAt && <div><dt className="text-muted-foreground">{t.captured}</dt><dd>{new Date(image.capturedAt).toLocaleDateString(locale === 'cz' ? 'cs-CZ' : locale === 'pl' ? 'pl-PL' : locale === 'en' ? 'en-GB' : 'de-DE')}</dd></div>}
                </dl>
                {detail.participants.length > 0 && <div className="border-t pt-4 text-sm"><p className="mb-2 text-muted-foreground">{t.onImage}</p>{detail.participants.map((participant) => <Link key={participant.participantKey} to={`/racepic/${detail.eventSlug}/${participant.participantKey}`} onClick={onClose} className="mr-2 inline-block rounded-full border px-3 py-1 hover:border-accent">#{participant.startNumber} {participant.displayName}</Link>)}</div>}
                {image.tags.length > 0 && <p className="text-xs text-muted-foreground">{image.tags.map((tag) => `#${tag}`).join('  ')}</p>}
              </aside>
            </div>
            {detail.relatedImages.length > 0 && <section className="p-5 sm:p-7"><h3 className="mb-4 font-heading text-xl font-bold">{t.moreImages}</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{detail.relatedImages.map((related) => <button key={related.imageId} type="button" onClick={() => onSelect({ eventSlug: detail.eventSlug, imageId: related.imageId })} className="overflow-hidden rounded-lg bg-muted text-left"><img src={toCdnUrl(related.thumbUrl)} alt={related.title || t.moreImage} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform hover:scale-105" /></button>)}</div></section>}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

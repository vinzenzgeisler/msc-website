import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RacePicImageDialog } from '@/components/racepic/RacePicImageDialog';
import { fetchParticipantGallery, toCdnUrl, type RacePicParticipantGallery } from '@/integrations/racepic/publicClient';
import { useRacePicText } from '@/i18n/racepic';

export default function RacePicParticipantPage() {
  const { eventSlug = '', participantKey = '' } = useParams<{ eventSlug: string; participantKey: string }>();
  const [params, setParams] = useSearchParams();
  const [gallery, setGallery] = useState<RacePicParticipantGallery | null>(null);
  const [error, setError] = useState(false);
  const t = useRacePicText();
  useEffect(() => {
    setGallery(null); setError(false);
    fetchParticipantGallery(eventSlug, participantKey).then(setGallery).catch(() => setError(true));
  }, [eventSlug, participantKey]);
  const selectedId = params.get('photo');
  const select = (imageId: string | null) => setParams((old) => {
    const next = new URLSearchParams(old);
    if (imageId) next.set('photo', imageId); else next.delete('photo');
    return next;
  });
  return <MainLayout title={gallery ? `RacePic – #${gallery.participant.startNumber} ${gallery.participant.displayName}` : 'RacePic'} description={t.participantDescription} canonicalPath={`/racepic/${eventSlug}/${participantKey}`}>
    <section className="container max-w-6xl py-12">
      <Link to="/racepic" className="text-sm text-muted-foreground hover:underline">‹ {t.backToRacePic}</Link>
      {!gallery && !error && <Loader2 className="mt-8 h-8 w-8 animate-spin text-accent" />}
      {error && <p className="mt-6 text-muted-foreground">{t.galleryNotFound}</p>}
      {gallery && <>
        <h1 className="mt-4 font-heading text-3xl font-black">#{gallery.participant.startNumber} {gallery.participant.displayName}</h1>
        <p className="mt-1 text-muted-foreground">{gallery.participant.make} {gallery.participant.model} · {gallery.participant.className}</p>
        <p className="mt-4 text-sm font-medium">{gallery.images.length} {t.images}</p>
        <div className="mt-6 columns-2 gap-3 sm:columns-3 md:columns-4 [&>*]:mb-3">
          {gallery.images.map((image) => <button type="button" key={image.imageId} onClick={() => select(image.imageId)} className="group block w-full overflow-hidden rounded-xl bg-muted shadow-sm transition hover:shadow-xl"><img src={toCdnUrl(image.thumbUrl)} alt={image.title || gallery.participant.displayName} loading="lazy" className="w-full object-cover transition-transform group-hover:scale-105" /></button>)}
        </div>
        {gallery.images.length === 0 && <p className="text-muted-foreground">{t.noVehicleImages}</p>}
      </>}
    </section>
    <RacePicImageDialog selected={selectedId ? { eventSlug, imageId: selectedId } : null} onSelect={(image) => select(image.imageId)} onClose={() => select(null)} />
  </MainLayout>;
}

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteMyImage, fetchMyEventAccess, hideMyImage, listMyImages, type PhotographerEventAccess, type UploadedImage } from '@/integrations/racepic/client';

const VISIBILITY_LABEL: Record<string, string> = {
  DRAFT: 'Entwurf',
  PUBLISHED: 'Veröffentlicht',
  HIDDEN: 'Verborgen',
  REMOVED: 'Entfernt',
};

/**
 * "Meine Bilder" (Paket 15), siehe racepic-ux-redesign-plan.md. `listMyImages` existierte bereits
 * als API-Client-Funktion, wurde bisher aber nirgends in einer UI verwendet - Fotograf:innen
 * konnten den Status ihrer eigenen Uploads bislang gar nicht einsehen.
 */
export function StudioImagesPanel() {
  const [events, setEvents] = useState<PhotographerEventAccess[]>([]);
  const [eventId, setEventId] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyEventAccess()
      .then((result) => setEvents(result.events))
      .catch(() => setEvents([]));
  }, []);

  const reload = () => {
    setLoading(true);
    listMyImages({ eventId: eventId || undefined, limit: 100 })
      .then((result) => {
        setImages(result.images);
        setError('');
      })
      .catch(() => setError('Bilder konnten nicht geladen werden.'))
      .finally(() => setLoading(false));
  };

  useEffect(reload, [eventId]);

  const handleHide = async (imageId: string) => {
    setBusyId(imageId);
    try {
      await hideMyImage(imageId);
      reload();
    } catch {
      setError('Verbergen fehlgeschlagen.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!window.confirm('Bild wirklich löschen? Das kann nicht rückgängig gemacht werden.')) return;
    setBusyId(imageId);
    try {
      await deleteMyImage(imageId);
      reload();
    } catch {
      setError('Löschen fehlgeschlagen.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {events.length > 1 && (
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          <option value="">Alle Events</option>
          {events.map((item) => (
            <option key={item.eventId} value={item.eventId}>
              {item.eventName}
            </option>
          ))}
        </select>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && <Loader2 className="h-6 w-6 animate-spin text-accent" />}

      {!loading && images.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Bilder hochgeladen.</p>}

      {!loading && images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-lg border bg-card">
              <div className="aspect-[4/3] bg-muted">
                {image.thumbUrl && <img src={image.thumbUrl} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="space-y-1.5 p-2">
                <Badge variant={image.visibility === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[10px]">
                  {VISIBILITY_LABEL[image.visibility] ?? image.visibility}
                </Badge>
                <p className="text-[11px] text-muted-foreground">{image.processingStatus}</p>
                <div className="flex flex-wrap gap-1">
                  {(image.visibility === 'PUBLISHED' || image.visibility === 'DRAFT') && (
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" disabled={busyId === image.id} onClick={() => handleHide(image.id)}>
                      Verbergen
                    </Button>
                  )}
                  {image.visibility === 'DRAFT' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px] text-destructive"
                      disabled={busyId === image.id}
                      onClick={() => handleDelete(image.id)}
                    >
                      Löschen
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

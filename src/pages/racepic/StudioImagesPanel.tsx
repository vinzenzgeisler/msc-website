import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { deleteMyImage, fetchLicenses, fetchMyEventAccess, fetchMyImageAssignments, hideMyImage, listMyImages, type LicenseOption, type OwnImageAssignment, type PhotographerEventAccess, type UploadedImage } from '@/integrations/racepic/client';
import { StudioImageEditor } from './StudioImageEditor';

const ASSIGNMENT_STATUS_LABEL: Record<string, string> = {
  AUTO_MATCHED: 'Automatisch erkannt',
  REVIEW_REQUIRED: 'Wird noch geprüft',
  MANUALLY_CONFIRMED: 'Bestätigt',
  MANUALLY_CORRECTED: 'Manuell korrigiert',
};

const VISIBILITY_LABEL: Record<string, string> = {
  DRAFT: 'Entwurf',
  PUBLISHED: 'Veröffentlicht',
  HIDDEN: 'Verborgen',
  REMOVED: 'Entfernt',
};
const PROCESSING_LABEL: Record<string, string> = {
  UPLOADED: 'Upload abgeschlossen', VALIDATED: 'Bild wird geprüft', DERIVED: 'Vorschau erstellt',
  ANALYZED: 'KI-Analyse abgeschlossen', MATCHED: 'Zuordnung geprüft', FAILED: 'Verarbeitung fehlgeschlagen', DUPLICATE: 'Duplikat'
};

/**
 * "Meine Bilder" (Paket 15), siehe racepic-ux-redesign-plan.md. `listMyImages` existierte bereits
 * als API-Client-Funktion, wurde bisher aber nirgends in einer UI verwendet - Fotograf:innen
 * konnten den Status ihrer eigenen Uploads bislang gar nicht einsehen.
 */
export function StudioImagesPanel() {
  const [events, setEvents] = useState<PhotographerEventAccess[]>([]);
  const [licenses, setLicenses] = useState<LicenseOption[]>([]);
  const [eventId, setEventId] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<UploadedImage | null>(null);
  const [previewing, setPreviewing] = useState<UploadedImage | null>(null);
  const [assignmentsForId, setAssignmentsForId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<OwnImageAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  useEffect(() => {
    fetchMyEventAccess()
      .then((result) => setEvents(result.events))
      .catch(() => setEvents([]));
    fetchLicenses().then((result) => setLicenses(result.licenses)).catch(() => setLicenses([]));
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
    if (!window.confirm('Bild wirklich rausnehmen? Das kann nicht rückgängig gemacht werden.')) return;
    setBusyId(imageId);
    try {
      await deleteMyImage(imageId);
      reload();
    } catch {
      setError('Rausnehmen fehlgeschlagen.');
    } finally {
      setBusyId(null);
    }
  };

  const toggleAssignments = (imageId: string) => {
    if (assignmentsForId === imageId) {
      setAssignmentsForId(null);
      return;
    }
    setAssignmentsForId(imageId);
    setAssignments([]);
    setAssignmentsLoading(true);
    fetchMyImageAssignments(imageId)
      .then((result) => setAssignments(result.assignments))
      .catch(() => setAssignments([]))
      .finally(() => setAssignmentsLoading(false));
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-lg border bg-card">
              <button type="button" disabled={!image.previewUrl} onClick={() => setPreviewing(image)} className="block aspect-[4/3] w-full bg-muted text-left">
                {image.thumbUrl && <img src={image.thumbUrl} alt={image.title ?? 'Eigenes Bild'} className="h-full w-full object-cover" />}
              </button>
              <div className="space-y-2 p-3">
                <Badge variant={image.visibility === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[10px]">
                  {VISIBILITY_LABEL[image.visibility] ?? image.visibility}
                </Badge>
                <p className="text-xs text-muted-foreground">{PROCESSING_LABEL[image.processingStatus] ?? image.processingStatus}</p>
                {image.title && <p className="truncate text-sm font-semibold">{image.title}</p>}
                {image.offerMode === 'PAID' && <p className="text-xs font-medium text-accent">Interner Preisentwurf · {((image.priceCents ?? 0) / 100).toFixed(2)} €</p>}
                <div className="flex flex-wrap gap-1">
                  {image.visibility !== 'REMOVED' && <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => setEditing(image)}>Bearbeiten</Button>}
                  {(image.visibility === 'PUBLISHED' || image.visibility === 'DRAFT') && (
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" disabled={busyId === image.id} onClick={() => handleHide(image.id)}>
                      Verbergen
                    </Button>
                  )}
                  {image.visibility !== 'REMOVED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px] text-destructive"
                      disabled={busyId === image.id}
                      onClick={() => handleDelete(image.id)}
                    >
                      Rausnehmen
                    </Button>
                  )}
                  {image.visibility !== 'REMOVED' && (
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => toggleAssignments(image.id)}>
                      Zuordnung
                    </Button>
                  )}
                </div>
                {assignmentsForId === image.id && (
                  <div className="rounded-md border bg-muted/40 p-2 text-[11px]">
                    {assignmentsLoading && <span className="text-muted-foreground">Lädt…</span>}
                    {!assignmentsLoading && assignments.length === 0 && (
                      <span className="text-muted-foreground">Noch keine Zuordnung - die KI hat entweder noch nicht fertig analysiert oder kein Fahrzeug erkannt.</span>
                    )}
                    {!assignmentsLoading && assignments.length > 0 && (
                      <ul className="space-y-1">
                        {assignments.map((a) => (
                          <li key={a.assignmentId} className="flex items-center justify-between gap-2">
                            <span>#{a.startNumber} {a.driverName}{a.vehicleMake ? ` · ${a.vehicleMake} ${a.vehicleModel ?? ''}`.trimEnd() : ''}</span>
                            <Badge variant="secondary" className="text-[9px]">{ASSIGNMENT_STATUS_LABEL[a.status] ?? a.status}</Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <StudioImageEditor image={editing} licenses={licenses} onClose={() => setEditing(null)} onSaved={reload} />
      <Dialog open={previewing !== null} onOpenChange={(open) => { if (!open) setPreviewing(null); }}><DialogContent className="max-w-5xl"><div className="space-y-3">{previewing?.previewUrl && <img src={previewing.previewUrl} alt={previewing.title ?? 'Eigene Bildvorschau'} className="max-h-[75vh] w-full object-contain" />}{previewing?.offerMode === 'PAID' && <p className="text-center text-sm text-muted-foreground">Interne Wasserzeichen-Vorschau · nicht öffentlich</p>}</div></DialogContent></Dialog>
    </div>
  );
}

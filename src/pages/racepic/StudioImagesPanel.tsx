import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { deleteMyImage, fetchLicenses, fetchMyEventAccess, fetchMyImageAssignments, fetchRacePicConfig, hideMyImage, listMyImages, listMyOfferConversions, type LicenseOption, type OfferConversion, type OwnImageAssignment, type PhotographerEventAccess, type UploadedImage } from '@/integrations/racepic/client';
import { CONVERSION_STATUS_LABEL, OPEN_CONVERSION_STATUSES } from '@/integrations/racepic/conversionMessages';
import { formatEuroCents } from '@/integrations/racepic/format';
import { StudioConversionDialog } from './StudioConversionDialog';
import { StudioImageEditor } from './StudioImageEditor';

/** Nur eigene, veroeffentlichte, kostenlose Bilder mit fertiger Verarbeitung koennen zur Preisumstellung beantragt werden. */
const CONVERTIBLE_PROCESSING = ['DERIVED', 'ANALYZED', 'MATCHED'];
const isConvertible = (image: UploadedImage) =>
  image.visibility === 'PUBLISHED' && image.offerMode === 'FREE' && CONVERTIBLE_PROCESSING.includes(image.processingStatus);

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
  const [conversionEnabled, setConversionEnabled] = useState(false);
  const [conversions, setConversions] = useState<OfferConversion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);

  const reloadConversions = () => {
    listMyOfferConversions().then((result) => setConversions(result.conversions)).catch(() => setConversions([]));
  };

  useEffect(() => {
    // Das Backend-Flag entscheidet; ohne (oder bei aelterem Backend) bleibt die Funktion unsichtbar.
    fetchRacePicConfig()
      .then((config) => {
        const enabled = config.commerce?.commerceFreeToPaidConversion === true;
        setConversionEnabled(enabled);
        if (enabled) reloadConversions();
      })
      .catch(() => setConversionEnabled(false));
  }, []);

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

  const pendingImageIds = new Set(
    conversions.filter((conversion) => OPEN_CONVERSION_STATUSES.includes(conversion.status)).flatMap((conversion) => conversion.items.map((item) => item.imageId))
  );
  const canRequestConversion = (image: UploadedImage) => conversionEnabled && isConvertible(image) && !pendingImageIds.has(image.id);
  const selectedImages = images.filter((image) => selectedIds.has(image.id) && canRequestConversion(image));
  const toggleSelected = (imageId: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(imageId)) next.delete(imageId);
      else next.add(imageId);
      return next;
    });

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

      {conversionEnabled && conversions.length > 0 && (
        <div className="space-y-2 rounded-lg border bg-card p-3">
          <p className="text-sm font-semibold">Anträge zum kostenpflichtigen Anbieten</p>
          <ul className="space-y-1 text-xs">
            {conversions.map((conversion) => (
              <li key={conversion.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{conversion.items.length} Bild(er) · {formatEuroCents(conversion.priceCents, 'de')} · {new Date(conversion.createdAt).toLocaleDateString('de-DE')}</span>
                <Badge variant={conversion.status === 'APPROVED' ? 'default' : 'secondary'} className="text-[10px]">{CONVERSION_STATUS_LABEL[conversion.status]}</Badge>
                {conversion.status === 'REJECTED' && conversion.reviewNote && <span className="w-full text-muted-foreground">Hinweis vom MSC: {conversion.reviewNote}</span>}
                {conversion.status === 'FAILED' && <span className="w-full text-destructive">Die Dateien konnten nicht vorbereitet werden. Du kannst einen neuen Antrag stellen.</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedImages.length > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background p-3 shadow">
          <span className="text-sm">{selectedImages.length} Bild(er) ausgewählt</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>Auswahl aufheben</Button>
            <Button size="sm" onClick={() => setConversionDialogOpen(true)}>Kostenpflichtig anbieten</Button>
          </div>
        </div>
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
                {image.offerMode === 'PAID' && <p className="text-xs font-medium text-accent">{image.visibility === 'PUBLISHED' ? 'Kostenpflichtig' : 'Interner Preisentwurf'} · {((image.priceCents ?? 0) / 100).toFixed(2)} €</p>}
                {pendingImageIds.has(image.id) && <p className="text-xs font-medium text-muted-foreground">Antrag auf Preisumstellung läuft</p>}
                {canRequestConversion(image) && (
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={selectedIds.has(image.id)} onChange={() => toggleSelected(image.id)} />
                    Zum kostenpflichtigen Anbieten auswählen
                  </label>
                )}
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
      <StudioConversionDialog
        open={conversionDialogOpen}
        images={selectedImages}
        licenses={licenses}
        onClose={() => setConversionDialogOpen(false)}
        onRequested={() => { setSelectedIds(new Set()); reloadConversions(); }}
      />
      <StudioImageEditor image={editing} licenses={licenses} onClose={() => setEditing(null)} onSaved={reload} />
      <Dialog open={previewing !== null} onOpenChange={(open) => { if (!open) setPreviewing(null); }}><DialogContent className="max-w-5xl"><div className="space-y-3">{previewing?.previewUrl && <img src={previewing.previewUrl} alt={previewing.title ?? 'Eigene Bildvorschau'} className="max-h-[75vh] w-full object-contain" />}{previewing?.offerMode === 'PAID' && <p className="text-center text-sm text-muted-foreground">Interne Wasserzeichen-Vorschau · nicht öffentlich</p>}</div></DialogContent></Dialog>
    </div>
  );
}

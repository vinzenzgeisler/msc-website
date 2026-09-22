import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateMyImageDetails, type LicenseOption, type UploadedImage } from '@/integrations/racepic/client';

export function StudioImageEditor({ image, licenses, onClose, onSaved }: {
  image: UploadedImage | null;
  licenses: LicenseOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [offerMode, setOfferMode] = useState<'FREE' | 'PAID'>('FREE');
  const [licenseId, setLicenseId] = useState('');
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!image) return;
    setTitle(image.title ?? '');
    setDescription(image.description ?? '');
    setTags((image.tags ?? []).join(', '));
    setOfferMode(image.offerMode);
    setLicenseId(image.licenseId ?? '');
    setPrice(image.priceCents ? (image.priceCents / 100).toFixed(2).replace('.', ',') : '');
    setError('');
  }, [image]);

  const modeLicenses = licenses.filter((license) => license.pricingKind === offerMode);
  const canChangeOffer = image?.visibility === 'DRAFT';
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!image) return;
    const cents = offerMode === 'PAID' ? Math.round(Number(price.replace(',', '.')) * 100) : null;
    if (offerMode === 'PAID' && (!Number.isInteger(cents) || !cents || cents < 1)) {
      setError('Bitte einen gültigen Preis in Euro eingeben.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await updateMyImageDetails(image.id, {
        title: title.trim() || null,
        description: description.trim() || null,
        tags: Array.from(new Set(tags.split(',').map((tag) => tag.trim()).filter(Boolean))).slice(0, 15),
        ...(canChangeOffer ? { offerMode, priceCents: cents, licenseId } : {})
      });
      onSaved();
      onClose();
    } catch { setError('Bildangaben konnten nicht gespeichert werden. Bitte Lizenz und Preis prüfen.'); }
    finally { setBusy(false); }
  };

  return <Dialog open={image !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>Bild bearbeiten</DialogTitle></DialogHeader>
      <form onSubmit={save} className="space-y-4">
        <div><Label htmlFor="studio-image-title">Titel</Label><Input id="studio-image-title" maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ein Moment von der Strecke" /></div>
        <div><Label htmlFor="studio-image-description">Beschreibung</Label><textarea id="studio-image-description" maxLength={2000} value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="Was ist auf dem Bild zu sehen?" /></div>
        <div><Label htmlFor="studio-image-tags">Tags</Label><Input id="studio-image-tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Motorsport, Kurve, Oldtimer" /><p className="mt-1 text-xs text-muted-foreground">Durch Kommas trennen, maximal 15 Tags.</p></div>
        {canChangeOffer && <>
          <div><Label htmlFor="studio-image-mode">Angebot</Label><select id="studio-image-mode" value={offerMode} onChange={(event) => { const mode = event.target.value as 'FREE' | 'PAID'; setOfferMode(mode); setLicenseId(licenses.find((license) => license.pricingKind === mode)?.id ?? ''); }} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="FREE">Kostenlos</option><option value="PAID">Kostenpflichtig – nur interner Test</option></select></div>
          <div><Label htmlFor="studio-image-license">Lizenz</Label><select id="studio-image-license" required value={licenseId} onChange={(event) => setLicenseId(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{modeLicenses.map((license) => <option key={license.id} value={license.id}>{license.title.de ?? license.code}</option>)}</select></div>
          {offerMode === 'PAID' && <div><Label htmlFor="studio-image-price">Preis in Euro</Label><Input id="studio-image-price" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="9,90" /><p className="mt-1 text-xs text-muted-foreground">Bezahlbilder bleiben bis zum fertigen Shop privat und können nicht veröffentlicht werden.</p></div>}
        </>}
        {!canChangeOffer && <p className="text-xs text-muted-foreground">Lizenz und Angebotsart sind nach der Veröffentlichung gesperrt. Titel und Beschreibung können weiter bearbeitet werden.</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy || (canChangeOffer && !licenseId)}>{busy ? 'Speichert…' : 'Speichern'}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}

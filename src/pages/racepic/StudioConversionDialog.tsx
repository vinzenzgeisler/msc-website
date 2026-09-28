import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RacePicApiError, requestOfferConversion, type LicenseOption, type OfferConversion, type UploadedImage } from '@/integrations/racepic/client';
import { conversionErrorMessage } from '@/integrations/racepic/conversionMessages';
import { formatEuroCents, PRICE_TIERS_CENTS } from '@/integrations/racepic/format';

/**
 * Antrag "Bilder kostenpflichtig anbieten" (FREE->PAID, Marketplace-Plan Abschnitt 5). Der Antrag aendert nichts
 * an der oeffentlichen Ausgabe; erst nach der Pruefung durch den MSC wird umgestellt. Preisstufen und Lizenz
 * gelten fuer alle ausgewaehlten Bilder. Der Rechtebestaetigungstext ist vorlaeufig (AP00: Freigabe durch Recht).
 */
export function StudioConversionDialog({ open, images, licenses, onClose, onRequested }: {
  open: boolean;
  images: UploadedImage[];
  licenses: LicenseOption[];
  onClose: () => void;
  onRequested: (conversion: OfferConversion) => void;
}) {
  const paidLicenses = licenses.filter((license) => license.pricingKind === 'PAID');
  const [priceCents, setPriceCents] = useState<number>(1000);
  const [licenseId, setLicenseId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<OfferConversion | null>(null);
  // Ein Key pro Antragsversuch: nach einem Fehler (auch Netzwerk) denselben Key erneut senden, damit nichts doppelt entsteht.
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;
    idempotencyKey.current = null;
    setConfirmed(false);
    setError('');
    setDone(null);
    setLicenseId((current) => current || paidLicenses[0]?.id || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!confirmed || !licenseId || images.length === 0) return;
    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    setBusy(true);
    setError('');
    try {
      const result = await requestOfferConversion(
        { imageIds: images.map((image) => image.id), priceCents, licenseId, rightsConfirmed: true },
        idempotencyKey.current
      );
      idempotencyKey.current = null;
      setDone(result.conversion);
      onRequested(result.conversion);
    } catch (err) {
      setError(conversionErrorMessage(err instanceof RacePicApiError ? err.code : undefined));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>Kostenpflichtig anbieten</DialogTitle></DialogHeader>
        {done ? (
          <div className="space-y-3 text-sm">
            <p className="font-medium">Dein Antrag für {done.items.length} Bild(er) ist eingegangen.</p>
            <p className="text-muted-foreground">
              Wir bereiten die Dateien vor und der MSC prüft den Antrag. Bis zur Freigabe bleiben deine Bilder unverändert kostenlos. Den Stand siehst du unter „Meine Bilder“.
            </p>
            <Button onClick={onClose}>Schließen</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {images.length} veröffentlichte Bild(er) ausgewählt. Preis und Lizenz gelten für alle ausgewählten Bilder.
            </p>
            <div>
              <Label htmlFor="conversion-price">Preis pro Bild</Label>
              <select id="conversion-price" value={priceCents} onChange={(event) => setPriceCents(Number(event.target.value))} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                {PRICE_TIERS_CENTS.map((cents) => <option key={cents} value={cents}>{formatEuroCents(cents, 'de')}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="conversion-license">Lizenz</Label>
              <select id="conversion-license" required value={licenseId} onChange={(event) => setLicenseId(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                {paidLicenses.length === 0 && <option value="">Keine kostenpflichtige Lizenz verfügbar</option>}
                {paidLicenses.map((license) => <option key={license.id} value={license.id}>{license.title.de ?? license.code}</option>)}
              </select>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
              <span>
                Ich bestätige, dass ich alle erforderlichen Rechte an den ausgewählten Bildern besitze und sie kostenpflichtig anbieten darf. Mir ist bewusst,
                dass die kostenlose Ausgabe dieser Bilder nach der Freigabe endet und der MSC bereits heruntergeladene oder gespeicherte Dateien nicht zurückrufen kann.
              </span>
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy || !confirmed || !licenseId || images.length === 0}>{busy ? 'Sendet…' : 'Antrag senden'}</Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

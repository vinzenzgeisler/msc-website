import { FormEvent, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { commerceErrorMessage, createCheckoutSession, createQuote, type LegalAcceptance } from '@/integrations/racepic/commerceClient';

/**
 * Kaufablauf fuer ein einzelnes kostenpflichtiges Bild (Marketplace-Plan AP12/AP15): E-Mail plus die zwei
 * Pflicht-Bestaetigungen aus dem Rechtstextentwurf (docs/racepic/legal/kaeufer-entwuerfe-v0.md Abschnitt 1),
 * dann Quote und Checkout-Session server-seitig erzeugen und zu Stripe weiterleiten. Die Rechtstexte sind noch
 * ein Entwurf (AP00 nicht freigegeben) - deshalb der Hinweis unten. Der Preis stammt ausschliesslich aus der
 * server-seitigen Quote, nie aus dem Manifest.
 */
export function RacePicBuyPanel({ imageId }: { imageId: string }) {
  const [email, setEmail] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedWaiver, setAcceptedWaiver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = email.trim().length > 3 && acceptedTerms && acceptedWaiver && !busy;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError('');
    try {
      const quote = await createQuote([imageId]);
      if (quote.items.length === 0) throw new Error('NOT_AVAILABLE');
      const legalAcceptance: LegalAcceptance = { terms: true, license: true, privacy: true, withdrawal: true, digitalContentWaiver: true };
      const session = await createCheckoutSession(quote.quoteId, email, legalAcceptance);
      window.location.assign(session.url);
    } catch (err) {
      setError(commerceErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border p-3 text-sm">
      <div>
        <Label htmlFor={`buy-email-${imageId}`} className="text-xs">
          E-Mail für Rechnung und Download
        </Label>
        <Input id={`buy-email-${imageId}`} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="du@beispiel.de" />
      </div>
      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-0.5" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
        <span>Ich habe die AGB, Lizenzbedingungen und Datenschutzhinweise gelesen und akzeptiere sie.</span>
      </label>
      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-0.5" checked={acceptedWaiver} onChange={(event) => setAcceptedWaiver(event.target.checked)} />
        <span>
          Ich stimme zu, dass der MSC vor Ablauf der Widerrufsfrist mit der Ausführung beginnt und mir die Datei sofort bereitstellt. Mir ist bekannt, dass ich
          dadurch mein Widerrufsrecht verliere.
        </span>
      </label>
      {error && <p className="text-destructive">{error}</p>}
      <Button type="submit" disabled={!canSubmit} className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Zahlungspflichtig bestellen'}
      </Button>
      <p className="text-[11px] text-muted-foreground">
        Testphase: Die Rechtstexte sind ein Entwurf. Es wird nur im Stripe-Testmodus abgerechnet, es fließt kein echtes Geld.
      </p>
    </form>
  );
}

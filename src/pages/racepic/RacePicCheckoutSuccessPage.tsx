import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { commerceErrorMessage, fetchOrderConfirmation, type OrderConfirmation } from '@/integrations/racepic/commerceClient';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 20; // ~40s: der Webhook trifft ueblicherweise binnen weniger Sekunden ein

/**
 * Erfolgsseite nach der Rueckkehr von Stripe (Marketplace-Plan AP15). Erfuellt selbst nichts - nur der Webhook
 * darf eine Bestellung auf PAID setzen (Abschnitt 3.2) - deshalb pollt diese Seite kurz, bis die Erfuellung
 * durchgelaufen ist, statt sich auf den Redirect allein zu verlassen.
 */
export default function RacePicCheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order') ?? '';
  const sessionId = searchParams.get('session_id') ?? '';
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState('');
  const attempts = useRef(0);

  useEffect(() => {
    if (!orderId || !sessionId) {
      setError('Dieser Link ist unvollständig.');
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const result = await fetchOrderConfirmation(orderId, sessionId);
        if (cancelled) return;
        setConfirmation(result);
        if (result.status === 'PENDING' && attempts.current < MAX_POLLS) {
          attempts.current += 1;
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (!cancelled) setError(commerceErrorMessage(err));
      }
    };
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId, sessionId]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-heading text-3xl font-black">Danke für deine Bestellung</h1>

      {error && <p className="mt-6 text-destructive">{error}</p>}

      {!error && (!confirmation || confirmation.status === 'PENDING') && (
        <div className="mt-8 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Die Zahlung wird bestätigt, das dauert meist nur wenige Sekunden…</span>
        </div>
      )}

      {confirmation?.status === 'FAILED' && <p className="mt-6 text-destructive">Die Zahlung ist nicht durchgegangen. Bitte versuche es erneut.</p>}

      {confirmation?.status === 'PAID' && (
        <div className="mt-8 space-y-4">
          <p className="text-muted-foreground">Deine Bilder stehen bereit:</p>
          {confirmation.items.map((item) => (
            <div key={item.imageId} className="rounded-lg border p-4">
              <p className="font-semibold">{item.title || 'Motorsport-Moment'}</p>
              <p className="text-sm text-muted-foreground">
                {item.attribution.photographerName}
                {item.attribution.attributionRequired ? ' · Namensnennung erforderlich' : ''}
              </p>
              <Button asChild className="mt-3">
                <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer">
                  Herunterladen
                </a>
              </Button>
              <p className="mt-1 text-[11px] text-muted-foreground">Der Link ist kurz gültig; lade die Datei gleich herunter.</p>
            </div>
          ))}
        </div>
      )}

      <Link to="/racepic" className="mt-10 inline-block text-sm text-muted-foreground hover:underline">
        Zurück zu RacePic
      </Link>
    </main>
  );
}

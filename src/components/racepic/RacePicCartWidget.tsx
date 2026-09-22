import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, Loader2, ShoppingBag, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRacePicCart } from '@/integrations/racepic/cart';
import { requestDownload, toCdnUrl } from '@/integrations/racepic/publicClient';

/**
 * Schwebender Warenkorb-/Konto-Einstieg (Paket 18), siehe racepic-ux-redesign-plan.md. Nur auf
 * `/racepic/*`-Seiten sichtbar. Das Konto-Icon ist bewusst deaktiviert (Tooltip) - es gibt noch
 * keine Käufer:innen-Authentifizierung, das kommt erst mit dem echten Shop/Checkout.
 */
export function RacePicCartWidget() {
  const location = useLocation();
  const { items, removeItem, clear } = useRacePicCart();
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  if (!location.pathname.startsWith('/racepic')) return null;
  if (location.pathname.startsWith('/racepic/studio')) return null;

  const handleDownloadAll = async () => {
    setDownloading(true);
    setError('');
    try {
      for (const item of items) {
        const result = await requestDownload(item.imageId, 'medium');
        window.open(result.url, '_blank', 'noopener');
        // Kleine Verzögerung zwischen den Downloads, damit Browser-Popup-Blocker nicht alle bis
        // auf den ersten unterdrücken - kein Ersatz für einen echten Sammel-Download/Zip, der
        // erst mit dem Checkout (Paket M1-M5) sinnvoll wird.
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    } catch {
      setError('Download fehlgeschlagen. Bitte einzeln versuchen.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-full shadow-lg" disabled>
                <User className="h-5 w-5" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Konto – kommt mit dem RacePic-Shop</TooltipContent>
        </Tooltip>
        <Button
          size="icon"
          className="relative h-11 w-11 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Warenkorb öffnen"
        >
          <ShoppingBag className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
              {items.length}
            </span>
          )}
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Warenkorb</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {items.length === 0 && <p className="text-sm text-muted-foreground">Noch keine Bilder ausgewählt.</p>}
            {items.map((item) => (
              <div key={item.imageId} className="flex items-center gap-3 rounded-lg border p-2">
                <img src={toCdnUrl(item.thumbUrl)} alt="" className="h-14 w-20 rounded object-cover" />
                <span className="flex-1 text-xs text-muted-foreground">{item.eventSlug}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.imageId)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {items.length > 0 && (
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-2" disabled={downloading} onClick={handleDownloadAll}>
                  {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Alle herunterladen
                </Button>
                <Button variant="outline" onClick={clear}>
                  Leeren
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

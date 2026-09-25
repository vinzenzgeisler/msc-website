import { ReactNode, useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { CartContext, type CartItem } from './cart-context';

/**
 * Client-seitiger Warenkorb (Paket 18), siehe racepic-ux-redesign-plan.md - reine
 * UI-Vorbereitung für den späteren RacePic-Shop, **kein** Backend, kein Checkout. Im MVP sammelt
 * er nur ausgewählte (kostenlose) Bilder für einen bequemen Sammel-Download - funktional identisch
 * zum bisherigen Einzel-Download (`requestDownload`), nur für mehrere Bilder auf einmal statt
 * Klick für Klick. Persistiert in `localStorage`, überlebt also einen Reload, ist aber rein
 * geräte-/browserlokal (kein Konto, kein serverseitiger Zustand).
 */

const STORAGE_KEY = 'racepic_cart';
const SAVED_STORAGE_KEY = 'racepic_saved_images';
const cartItemSchema = z.object({
  imageId: z.string().uuid(),
  eventSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  thumbUrl: z.string().regex(/^\/public\/[0-9a-f-]+\/thumb\.webp$/i)
});

const readStoredItems = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = z.array(cartItemSchema).max(100).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data as CartItem[] : [];
  } catch {
    return [];
  }
};

export function RacePicCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredItems());
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const value = JSON.parse(window.localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
      const parsed = z.array(z.string().uuid()).max(1000).safeParse(value);
      return parsed.success ? parsed.data : [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Privater Modus o. ä. - Warenkorb lebt dann nur für die aktuelle Sitzung nicht weiter.
    }
  }, [items]);

  useEffect(() => {
    try { window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds)); } catch { /* private mode */ }
  }, [savedIds]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => (prev.some((existing) => existing.imageId === item.imageId) ? prev : [...prev, item]));
  }, []);

  const removeItem = useCallback((imageId: string) => {
    setItems((prev) => prev.filter((item) => item.imageId !== imageId));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const has = useCallback((imageId: string) => items.some((item) => item.imageId === imageId), [items]);
  const toggleSaved = useCallback((imageId: string) => {
    setSavedIds((prev) => prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]);
  }, []);
  const isSaved = useCallback((imageId: string) => savedIds.includes(imageId), [savedIds]);

  return <CartContext.Provider value={{ items, addItem, removeItem, clear, has, savedIds, toggleSaved, isSaved }}>{children}</CartContext.Provider>;
}

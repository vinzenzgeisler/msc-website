import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Client-seitiger Warenkorb (Paket 18), siehe racepic-ux-redesign-plan.md - reine
 * UI-Vorbereitung für den späteren RacePic-Shop, **kein** Backend, kein Checkout. Im MVP sammelt
 * er nur ausgewählte (kostenlose) Bilder für einen bequemen Sammel-Download - funktional identisch
 * zum bisherigen Einzel-Download (`requestDownload`), nur für mehrere Bilder auf einmal statt
 * Klick für Klick. Persistiert in `localStorage`, überlebt also einen Reload, ist aber rein
 * geräte-/browserlokal (kein Konto, kein serverseitiger Zustand).
 */

export type CartItem = {
  imageId: string;
  eventSlug: string;
  thumbUrl: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (imageId: string) => void;
  clear: () => void;
  has: (imageId: string) => boolean;
  savedIds: string[];
  toggleSaved: (imageId: string) => void;
  isSaved: (imageId: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'racepic_cart';
const SAVED_STORAGE_KEY = 'racepic_saved_images';

const readStoredItems = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function RacePicCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredItems());
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const value = JSON.parse(window.localStorage.getItem(SAVED_STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string').slice(0, 1000) : [];
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

export function useRacePicCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useRacePicCart must be used within a RacePicCartProvider');
  return context;
}

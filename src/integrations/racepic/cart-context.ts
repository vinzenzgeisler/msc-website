import { createContext, useContext } from 'react';

export type CartItem = { imageId: string; eventSlug: string; thumbUrl: string };

export type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (imageId: string) => void;
  clear: () => void;
  has: (imageId: string) => boolean;
  savedIds: string[];
  toggleSaved: (imageId: string) => void;
  isSaved: (imageId: string) => boolean;
};

export const CartContext = createContext<CartContextValue | null>(null);

export function useRacePicCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useRacePicCart must be used within a RacePicCartProvider');
  return context;
}

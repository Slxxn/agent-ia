import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string, variant?: string) => void;
  updateQuantity: (id: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const key = newItem.id + (newItem.variant ?? '');
          const existing = state.items.find(i => i.id + (i.variant ?? '') === key);
          if (existing) {
            return { items: state.items.map(i => i.id + (i.variant ?? '') === key ? { ...i, quantity: i.quantity + 1 } : i), isOpen: true };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }], isOpen: true };
        });
      },

      removeItem: (id, variant) => {
        const key = id + (variant ?? '');
        set(state => ({ items: state.items.filter(i => i.id + (i.variant ?? '') !== key) }));
      },

      updateQuantity: (id, quantity, variant) => {
        const key = id + (variant ?? '');
        if (quantity <= 0) {
          set(state => ({ items: state.items.filter(i => i.id + (i.variant ?? '') !== key) }));
        } else {
          set(state => ({ items: state.items.map(i => i.id + (i.variant ?? '') === key ? { ...i, quantity } : i) }));
        }
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage', partialize: (state) => ({ items: state.items }) }
  )
);

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from './ToastContext';
import { DELIVERY_FEE, FREE_SHIPPING } from '../lib/format';

const Ctx = createContext(null);
export const useShop = () => useContext(Ctx);

const CART_KEY = 'shopassist_cart_v1';
const WISH_KEY = 'shopassist_wishlist_v1';

const load = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — cart still works for this page view */
  }
};

export function ShopProvider({ children }) {
  const toast = useToast();
  const [items, setItems] = useState(() => load(CART_KEY, []));
  const [wishlist, setWishlist] = useState(() => load(WISH_KEY, []));

  useEffect(() => save(CART_KEY, items), [items]);
  useEffect(() => save(WISH_KEY, wishlist), [wishlist]);

  const add = useCallback(
    (p, qty = 1, { silent = false } = {}) => {
      if (!p || p.stock <= 0) {
        toast.error('Sorry, this item is out of stock.');
        return false;
      }
      setItems((cur) => {
        const existing = cur.find((i) => i.id === p.id);
        if (existing) {
          return cur.map((i) =>
            i.id === p.id ? { ...i, qty: Math.min(i.qty + qty, p.stock), stock: p.stock } : i
          );
        }
        return [
          ...cur,
          {
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            oldPrice: p.oldPrice || p.price,
            image: p.image,
            stock: p.stock,
            qty: Math.min(qty, p.stock),
          },
        ];
      });
      if (!silent) toast.success(`${p.name} added to cart`);
      return true;
    },
    [toast]
  );

  const remove = useCallback((id) => setItems((cur) => cur.filter((i) => i.id !== id)), []);

  const setQty = useCallback((id, qty) => {
    setItems((cur) =>
      cur.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || 1)) } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const toggleWish = useCallback(
    (p) => {
      setWishlist((cur) => {
        const has = cur.includes(p.id);
        toast[has ? 'info' : 'success'](has ? 'Removed from wishlist' : 'Saved to wishlist');
        return has ? cur.filter((x) => x !== p.id) : [...cur, p.id];
      });
    },
    [toast]
  );

  const totals = useMemo(() => {
    const mrp = items.reduce((s, i) => s + i.oldPrice * i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const delivery = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : DELIVERY_FEE;
    return {
      mrp,
      subtotal,
      discount: Math.max(0, mrp - subtotal),
      delivery,
      total: subtotal + delivery,
      count: items.reduce((s, i) => s + i.qty, 0),
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      totals,
      add,
      remove,
      setQty,
      clear,
      wishlist,
      toggleWish,
      isWished: (id) => wishlist.includes(id),
    }),
    [items, totals, add, remove, setQty, clear, wishlist, toggleWish]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

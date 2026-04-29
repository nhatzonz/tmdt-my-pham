"use client";

import { useEffect, useState } from "react";
import { cartStorage, type CartItem } from "@/lib/cart-storage";

/**
 * Reactive cart state (localStorage). Sync qua:
 * - `storage` event (khi tab khác update)
 * - `cart:updated` custom event (same-tab update)
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(cartStorage.getAll());
    setLoaded(true);

    const sync = () => setItems(cartStorage.getAll());
    window.addEventListener("storage", sync);
    window.addEventListener("cart:updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cart:updated", sync);
    };
  }, []);

  function notify(next: CartItem[]) {
    setItems(next);
    window.dispatchEvent(new Event("cart:updated"));
  }

  function upsert(item: CartItem) {
    notify(cartStorage.upsert(item));
  }
  function setQuantity(sanPhamId: number, soLuong: number) {
    notify(cartStorage.setQuantity(sanPhamId, soLuong));
  }
  function remove(sanPhamId: number) {
    notify(cartStorage.remove(sanPhamId));
  }
  function clear() {
    cartStorage.clear();
    notify([]);
  }

  const totalCount = items.reduce((sum, i) => sum + i.soLuong, 0);

  return { items, loaded, totalCount, upsert, setQuantity, remove, clear };
}

const CART_KEY = "ngoclan.cart.v1";

export type CartItem = {
  sanPhamId: number;
  soLuong: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function read(): CartItem[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export const cartStorage = {
  getAll(): CartItem[] {
    return read();
  },

  upsert(item: CartItem): CartItem[] {
    const items = read();
    const idx = items.findIndex((i) => i.sanPhamId === item.sanPhamId);
    if (idx >= 0) {
      items[idx] = { ...items[idx], soLuong: items[idx]!.soLuong + item.soLuong };
    } else {
      items.push(item);
    }
    write(items);
    return items;
  },

  setQuantity(sanPhamId: number, soLuong: number): CartItem[] {
    const items = read();
    const next =
      soLuong <= 0
        ? items.filter((i) => i.sanPhamId !== sanPhamId)
        : items.map((i) => (i.sanPhamId === sanPhamId ? { ...i, soLuong } : i));
    write(next);
    return next;
  },

  remove(sanPhamId: number): CartItem[] {
    const next = read().filter((i) => i.sanPhamId !== sanPhamId);
    write(next);
    return next;
  },

  clear(): void {
    write([]);
  },
};



const SHIPPING_KEY = "ngoclan.shipping.v1";

export type ShippingInfo = {
  hoTen: string;
  soDienThoai: string;
  diaChi: string;
  tinh: string;
  quan: string;
  phuong: string;
  fullText: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export const shippingStorage = {
  get(): ShippingInfo | null {
    if (!isBrowser()) return null;
    const raw = window.localStorage.getItem(SHIPPING_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed as ShippingInfo;
      return null;
    } catch {
      return null;
    }
  },

  set(info: ShippingInfo): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(SHIPPING_KEY, JSON.stringify(info));
  },
};

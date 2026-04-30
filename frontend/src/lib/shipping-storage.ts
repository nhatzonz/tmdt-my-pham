/**
 * Lưu thông tin giao hàng (tên, SĐT, địa chỉ) vào localStorage để
 * lần sau quay lại /thanh-toan tự fill.
 *
 * Khác với cartStorage / authStorage — KHÔNG clear khi logout.
 * Chỉ ghi đè khi user:
 *   1. Bấm nút "Lưu thông tin giao hàng" thủ công
 *   2. Đặt hàng thành công (dùng đúng thông tin đó là OK → lưu lại)
 */

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

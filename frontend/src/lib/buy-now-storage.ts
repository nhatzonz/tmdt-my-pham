/**
 * Tách "Mua ngay" khỏi giỏ hàng — lưu trong sessionStorage để chỉ
 * tồn tại trong tab hiện tại và tự xoá khi đóng tab.
 * Trang /thanh-toan đọc buyNowStorage trước; nếu có → checkout với 1 sp duy nhất,
 * không động vào giỏ.
 */

const BUYNOW_KEY = "ngoclan.buynow.v1";

export type BuyNowItem = {
  sanPhamId: number;
  soLuong: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export const buyNowStorage = {
  set(item: BuyNowItem): void {
    if (!isBrowser()) return;
    window.sessionStorage.setItem(BUYNOW_KEY, JSON.stringify(item));
  },

  get(): BuyNowItem | null {
    if (!isBrowser()) return null;
    const raw = window.sessionStorage.getItem(BUYNOW_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (
        parsed
        && typeof parsed === "object"
        && typeof parsed.sanPhamId === "number"
        && typeof parsed.soLuong === "number"
      ) {
        return parsed as BuyNowItem;
      }
      return null;
    } catch {
      return null;
    }
  },

  clear(): void {
    if (!isBrowser()) return;
    window.sessionStorage.removeItem(BUYNOW_KEY);
  },
};

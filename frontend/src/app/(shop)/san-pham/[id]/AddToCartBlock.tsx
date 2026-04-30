"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { orderApi } from "@/features/don-hang/api";
import { useCart } from "@/features/gio-hang/hooks/use-cart";
import { ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

type Props = {
  productId: number;
  price: number;
  hetHang?: boolean;
  soLuongTon?: number;
};

export function AddToCartBlock({ productId, price, hetHang, soLuongTon }: Props) {
  const router = useRouter();
  const { upsert } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function checkAndAdd(): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      const res = await orderApi.checkStock({ sanPhamId: productId, soLuong: qty });
      if (!res.ok) {
        setError(res.error ?? "Hết hàng");
        return false;
      }
      upsert({ sanPhamId: productId, soLuong: qty });
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi kiểm tồn kho");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    const ok = await checkAndAdd();
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  }

  async function handleBuyNow() {
    const ok = await checkAndAdd();
    if (ok) router.push("/thanh-toan");
  }

  if (hetHang) {
    return (
      <div className="flex flex-col gap-2">
        <Button size="lg" disabled className="w-full">
          Hết hàng
        </Button>
        <p className="text-xs text-[color:var(--color-muted)]">
          Sản phẩm tạm hết hàng — vui lòng quay lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <NumberStepper value={qty} onChange={setQty} />
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={handleAdd}
          disabled={busy}
        >
          {added ? (
            <>
              <Check className="size-4" /> Đã thêm
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" /> Thêm vào giỏ ·{" "}
              {formatCurrency(price * qty)}
            </>
          )}
        </Button>
        <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={busy}>
          Mua ngay
        </Button>
      </div>
      {soLuongTon !== undefined && soLuongTon > 0 && soLuongTon <= 5 && (
        <p className="text-xs text-amber-700">Chỉ còn {soLuongTon} sản phẩm</p>
      )}
      {error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
      )}
    </div>
  );
}

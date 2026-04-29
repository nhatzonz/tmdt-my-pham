"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { useCart } from "@/features/gio-hang/hooks/use-cart";
import {
  imageUrl,
  pastelBg,
  productApi,
  type Product,
} from "@/features/san-pham/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

const FREE_SHIP_THRESHOLD = 500_000;
const VAT_RATE = 0.08;

export default function GioHangPage() {
  const { items, loaded: cartLoaded, setQuantity, remove } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    productApi
      .list()
      .then(setProducts)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Lỗi tải sản phẩm"),
      )
      .finally(() => setLoadingProducts(false));
  }, []);

  if (!cartLoaded || loadingProducts) {
    return (
      <div className="mx-auto w-4/5 px-6 py-20 text-center text-sm text-[color:var(--color-muted)]">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-serif text-4xl md:text-5xl">Giỏ hàng của bạn</h1>
        <p className="mt-4 text-sm text-[color:var(--color-muted)]">
          Giỏ hàng đang trống — hãy chọn vài sản phẩm yêu thích.
        </p>
        <Link href="/san-pham" className="mt-8 inline-block">
          <Button size="lg">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const rows = items
    .map((item) => {
      const product = productMap.get(item.sanPhamId);
      return product ? { item, product } : null;
    })
    .filter(
      (r): r is { item: (typeof items)[number]; product: Product } => r !== null,
    );

  const subtotal = rows.reduce((s, r) => s + r.product.gia * r.item.soLuong, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;
  const remain = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const progress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIP_THRESHOLD) * 100),
  );

  return (
    <div className="mx-auto w-4/5 px-6 py-10">
      <h1 className="font-serif text-4xl md:text-5xl">Giỏ hàng của bạn</h1>
      <p className="mt-3 text-sm text-[color:var(--color-muted)]">
        {rows.length} sản phẩm · Miễn phí vận chuyển cho đơn từ{" "}
        {formatCurrency(FREE_SHIP_THRESHOLD)}
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <div className="rounded-xl bg-[color:var(--color-pastel-cream)]/40 p-4 ring-1 ring-[color:var(--color-border)]">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span>
                {remain > 0 ? (
                  <>
                    Còn <strong>{formatCurrency(remain)}</strong> để được miễn phí vận
                    chuyển ✦
                  </>
                ) : (
                  <>✓ Đã đạt điều kiện miễn phí vận chuyển</>
                )}
              </span>
              <span className="text-[color:var(--color-muted)]">
                {formatCurrency(subtotal)} /{" "}
                {formatCurrency(FREE_SHIP_THRESHOLD)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-[color:var(--color-ink)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 divide-y divide-[color:var(--color-border)]">
            {rows.map(({ item, product }) => (
              <CartLine
                key={product.id}
                product={product}
                quantity={item.soLuong}
                onQuantityChange={(q) => setQuantity(product.id, q)}
                onRemove={() => remove(product.id)}
              />
            ))}
          </div>
        </div>

        <aside className="flex h-fit flex-col gap-5 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <h2 className="font-medium">Tóm tắt đơn hàng</h2>

          <div className="flex items-start gap-2 rounded-lg bg-[color:var(--color-pastel-cream)]/40 px-3 py-2 text-xs text-[color:var(--color-ink-soft)]">
            <Tag className="mt-0.5 size-3.5" />
            <span>
              Có mã giảm giá? Nhập ở bước <strong>Thanh toán</strong> — server sẽ kiểm tra & áp dụng tự động.
            </span>
          </div>

          <div className="flex flex-col gap-2.5 text-sm">
            <Row label="Tạm tính" value={formatCurrency(subtotal)} />
            <Row label="Vận chuyển" value="Miễn phí" />
            <Row
              label={`Thuế VAT (${Math.round(VAT_RATE * 100)}%)`}
              value={formatCurrency(vat)}
            />
          </div>

          <div className="flex items-baseline justify-between border-t border-[color:var(--color-border)] pt-4">
            <span className="text-sm">Tổng cộng</span>
            <span className="font-serif text-3xl">{formatCurrency(total)}</span>
          </div>

          <Link href="/thanh-toan" className="w-full">
            <Button size="lg" className="w-full">
              Tiến hành thanh toán
            </Button>
          </Link>
          <Link
            href="/san-pham"
            className="text-center text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            Tiếp tục mua sắm
          </Link>
        </aside>
      </div>
    </div>
  );
}

function CartLine({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}: {
  product: Product;
  quantity: number;
  onQuantityChange: (next: number) => void;
  onRemove: () => void;
}) {
  const img = imageUrl(product.hinhAnh?.[0]);
  return (
    <div className="flex items-start gap-4 py-5">
      <Link
        href={`/san-pham/${product.id}`}
        className={cn(
          "flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl",
          pastelBg(product.id),
        )}
      >
        {img ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={img} alt={product.tenSanPham} className="h-full w-full object-cover" />
        ) : (
          <div className="h-12 w-6 rounded bg-white/80" />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
          {(product.thuongHieu ?? "NGỌC LAN BEAUTY").toUpperCase()}
        </p>
        <Link
          href={`/san-pham/${product.id}`}
          className="font-medium hover:underline"
        >
          {product.tenSanPham}
        </Link>
        <p className="text-xs text-[color:var(--color-muted)]">
          Loại da: {product.loaiDa}
        </p>
        <div className="mt-2 flex items-center gap-4 text-xs">
          <NumberStepper value={quantity} onChange={onQuantityChange} />
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-[color:var(--color-muted)] hover:text-rose-600"
          >
            <Trash2 className="size-3.5" /> Xoá
          </button>
        </div>
      </div>

      <div className="text-right">
        <div className="font-serif text-xl">
          {formatCurrency(product.gia * quantity)}
        </div>
        {quantity > 1 && (
          <div className="text-xs text-[color:var(--color-muted)]">
            {formatCurrency(product.gia)} × {quantity}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[color:var(--color-muted)]">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tag, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { couponApi, type Coupon } from "@/features/khuyen-mai/api";
import {
  VietnamAddressPicker,
  type VietnamAddress,
} from "@/features/dia-chi/VietnamAddressPicker";
import { orderApi } from "@/features/don-hang/api";
import { useCart } from "@/features/gio-hang/hooks/use-cart";
import {
  imageUrl,
  pastelBg,
  productApi,
  type Product,
} from "@/features/san-pham/api";
import { ApiError } from "@/lib/api-client";
import { buyNowStorage, type BuyNowItem } from "@/lib/buy-now-storage";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { shippingStorage } from "@/lib/shipping-storage";

export default function ThanhToanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items: cartItems, loaded: cartLoaded, clear: clearCart } = useCart();
  const [buyNow, setBuyNow] = useState<BuyNowItem | null>(null);
  const [buyNowLoaded, setBuyNowLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [hoTen, setHoTen] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [vnAddress, setVnAddress] = useState<VietnamAddress>({
    tinh: "",
    quan: "",
    phuong: "",
    fullText: "",
  });
  const [maCoupon, setMaCoupon] = useState("");
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [hasSavedShipping, setHasSavedShipping] = useState(false);

  useEffect(() => {
    setBuyNow(buyNowStorage.get());
    setBuyNowLoaded(true);
  }, []);

  useEffect(() => {
    couponApi.listPublic().then(setCoupons).catch(() => setCoupons([]));
  }, []);

  useEffect(() => {
    productApi
      .list()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Prefill: ưu tiên shippingStorage (đã lưu lần trước), fallback về user.
  useEffect(() => {
    const saved = shippingStorage.get();
    if (saved) {
      setHasSavedShipping(true);
      setHoTen(saved.hoTen ?? "");
      setSoDienThoai(saved.soDienThoai ?? "");
      setDiaChi(saved.diaChi ?? "");
      setVnAddress({
        tinh: saved.tinh ?? "",
        quan: saved.quan ?? "",
        phuong: saved.phuong ?? "",
        fullText: saved.fullText ?? "",
      });
      return;
    }
    if (user) {
      setHoTen(user.hoTen);
      if (user.soDienThoai) setSoDienThoai(user.soDienThoai);
    }
  }, [user]);

  function persistShipping() {
    shippingStorage.set({
      hoTen,
      soDienThoai,
      diaChi,
      tinh: vnAddress.tinh,
      quan: vnAddress.quan,
      phuong: vnAddress.phuong,
      fullText: vnAddress.fullText,
    });
    setHasSavedShipping(true);
  }

  function handleSaveShipping() {
    if (!hoTen.trim() || !soDienThoai.trim() || !vnAddress.fullText) {
      setSavedMsg("Vui lòng nhập đủ Tên, SĐT và Tỉnh/Quận/Phường trước khi lưu.");
      setTimeout(() => setSavedMsg(null), 3000);
      return;
    }
    persistShipping();
    setSavedMsg("Đã lưu thông tin giao hàng cho lần sau.");
    setTimeout(() => setSavedMsg(null), 2500);
  }

  if (!cartLoaded || !buyNowLoaded || loadingProducts) {
    return (
      <div className="mx-auto w-4/5 px-6 py-20 text-center text-sm text-[color:var(--color-muted)]">
        Đang tải...
      </div>
    );
  }

  // Mua ngay: chỉ checkout 1 sp duy nhất, không dùng giỏ.
  const checkoutItems = buyNow ? [buyNow] : cartItems;

  if (checkoutItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-serif text-4xl">Thanh toán</h1>
        <p className="mt-4 text-sm text-[color:var(--color-muted)]">
          Giỏ hàng trống — hãy thêm sản phẩm trước khi thanh toán.
        </p>
        <Link href="/san-pham" className="mt-8 inline-block">
          <Button size="lg">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const rows = checkoutItems
    .map((item) => {
      const product = productMap.get(item.sanPhamId);
      return product ? { item, product } : null;
    })
    .filter(
      (r): r is { item: (typeof checkoutItems)[number]; product: Product } => r !== null,
    );

  const subtotal = rows.reduce((s, r) => s + r.product.gia * r.item.soLuong, 0);
  const total = subtotal;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vnAddress.fullText) {
      setError("Vui lòng chọn đầy đủ Tỉnh / Quận / Phường.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const fullAddress = [diaChi, vnAddress.fullText].filter(Boolean).join(", ");
      const order = await orderApi.checkout({
        items: checkoutItems.map((it) => ({
          sanPhamId: it.sanPhamId,
          soLuong: it.soLuong,
        })),
        diaChiGiao: `${hoTen} · ${soDienThoai} · ${fullAddress}`,
        maCoupon: maCoupon || undefined,
        phuongThucTt: "COD",
      });
      // Lưu thông tin giao hàng cho lần sau (đặt thành công = thông tin hợp lệ).
      persistShipping();
      // Mua ngay: chỉ xoá buyNowStorage; giỏ giữ nguyên.
      // Checkout từ giỏ: clear cart như cũ.
      if (buyNow) {
        buyNowStorage.clear();
      } else {
        clearCart();
      }
      router.push(`/don-hang/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đặt hàng thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-4/5 px-6 py-10">
      <h1 className="font-serif text-4xl md:text-5xl">Thanh toán</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]"
      >
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-5 font-serif text-2xl">Địa chỉ giao hàng</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="ho_ten"
                label="Họ và tên"
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                required
              />
              <Input
                name="so_dien_thoai"
                label="Số điện thoại"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
                required
                pattern="[0-9 +]+"
              />
              <div className="sm:col-span-2">
                <Input
                  name="dia_chi"
                  label="Số nhà, ngõ, đường"
                  placeholder="vd: 18 ngõ 42 Kim Mã"
                  value={diaChi}
                  onChange={(e) => setDiaChi(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <VietnamAddressPicker value={vnAddress} onChange={setVnAddress} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={handleSaveShipping}>
                Lưu thông tin giao hàng
              </Button>
              {hasSavedShipping && (
                <span className="text-xs text-[color:var(--color-muted)]">
                  Đã lưu — lần sau sẽ tự điền lại
                </span>
              )}
              {savedMsg && (
                <span
                  className={cn(
                    "text-xs",
                    savedMsg.startsWith("Đã lưu")
                      ? "text-emerald-700"
                      : "text-rose-700",
                  )}
                >
                  {savedMsg}
                </span>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-5 font-serif text-2xl">Phương thức vận chuyển</h2>
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-[color:var(--color-ink)] bg-white p-4">
              <input type="radio" name="shipping" defaultChecked readOnly />
              <Truck className="size-5 text-[color:var(--color-muted)]" />
              <div className="flex-1">
                <p className="text-sm font-medium">Giao tiêu chuẩn</p>
                <p className="text-xs text-[color:var(--color-muted)]">
                  2–3 ngày làm việc · Miễn phí
                </p>
              </div>
              <span className="text-sm">Miễn phí</span>
            </label>
          </section>

          <section>
            <h2 className="mb-5 font-serif text-2xl">Phương thức thanh toán</h2>
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-[color:var(--color-ink)] bg-white p-4">
              <input type="radio" name="payment" defaultChecked readOnly />
              <div className="flex-1">
                <p className="text-sm font-medium">COD — Thanh toán khi nhận hàng</p>
                <p className="text-xs text-[color:var(--color-muted)]">
                  Plan giai đoạn này dùng COD (mock)
                </p>
              </div>
            </label>
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-5 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <h2 className="font-medium">Đơn hàng ({rows.length})</h2>

          <div className="flex flex-col gap-3">
            {rows.map(({ item, product }) => {
              const img = imageUrl(product.hinhAnh?.[0]);
              return (
                <div key={product.id} className="flex items-center gap-3 text-sm">
                  <div
                    className={cn(
                      "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg",
                      pastelBg(product.id),
                    )}
                  >
                    {img && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img}
                        alt={product.tenSanPham}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-1">{product.tenSanPham}</p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                      × {item.soLuong}
                    </p>
                  </div>
                  <span>{formatCurrency(product.gia * item.soLuong)}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4">
            <div className="flex gap-2">
              <Input
                name="ma_giam_gia"
                placeholder="Nhập mã hoặc chọn từ danh sách"
                value={maCoupon}
                onChange={(e) => setMaCoupon(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCouponModal(true)}
                className="shrink-0"
              >
                <Tag className="size-3.5" />
                Chọn mã
              </Button>
            </div>
            <p className="text-[11px] text-[color:var(--color-muted)]">
              Server sẽ kiểm tra & tính giảm khi đặt hàng.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4 text-sm">
            <Row label="Tạm tính" value={formatCurrency(subtotal)} />
            <Row label="Vận chuyển" value="Miễn phí" />
          </div>

          <div className="flex items-baseline justify-between border-t border-[color:var(--color-border)] pt-4">
            <span className="text-sm">Tổng (chưa giảm)</span>
            <span className="font-serif text-2xl">{formatCurrency(total)}</span>
          </div>
          <p className="text-[11px] text-[color:var(--color-muted)]">
            Mã giảm giá sẽ được áp dụng ở bước cuối khi đặt hàng.
          </p>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}

          <Button size="lg" type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Đang đặt..." : `Đặt hàng · ${formatCurrency(total)}`}
          </Button>
          <p className="text-center text-[11px] text-[color:var(--color-muted)]">
            Bằng việc đặt hàng bạn đồng ý với Điều khoản &amp; Chính sách bảo mật.
          </p>
        </aside>
      </form>

      {showCouponModal && (
        <CouponPickerModal
          coupons={coupons}
          selected={maCoupon}
          onSelect={(code) => {
            setMaCoupon(code);
            setShowCouponModal(false);
          }}
          onClose={() => setShowCouponModal(false)}
        />
      )}
    </div>
  );
}

function CouponPickerModal({
  coupons,
  selected,
  onSelect,
  onClose,
}: {
  coupons: Coupon[];
  selected: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const now = Date.now();
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-6 py-4">
          <h2 className="font-serif text-xl">Chọn mã giảm giá</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-full p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-ivory-2)] hover:text-[color:var(--color-ink)]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {coupons.length === 0 ? (
            <p className="py-8 text-center text-sm text-[color:var(--color-muted)]">
              Chưa có mã giảm giá nào.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {coupons.map((c) => (
                <CouponItem
                  key={c.id}
                  coupon={c}
                  now={now}
                  isSelected={
                    selected.trim().toUpperCase() === c.maCode.toUpperCase()
                  }
                  onSelect={() => onSelect(c.maCode)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function CouponItem({
  coupon,
  now,
  isSelected,
  onSelect,
}: {
  coupon: Coupon;
  now: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const startMs = new Date(coupon.startAt).getTime();
  const endMs = new Date(coupon.endAt).getTime();
  const expired = endMs < now;
  const notYet = startMs > now;
  const inactive = coupon.status !== "ACTIVE";
  const outOfQuota =
    coupon.soLuong != null && (coupon.conLai ?? 0) <= 0;
  const disabled = inactive || expired || notYet || outOfQuota;

  let reason: string | null = null;
  if (inactive) reason = "Đang tạm dừng";
  else if (notYet) reason = "Chưa bắt đầu";
  else if (expired) reason = "Đã hết hạn";
  else if (outOfQuota) reason = "Đã hết lượt dùng";

  return (
    <li>
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "w-full rounded-xl border-2 border-dashed p-4 text-left transition",
          disabled
            ? "cursor-not-allowed border-[color:var(--color-border)] bg-[color:var(--color-ivory-2)]/40 opacity-60"
            : isSelected
              ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)]/5"
              : "border-[color:var(--color-border)] bg-white hover:border-[color:var(--color-ink)] hover:bg-[color:var(--color-ivory-2)]/30",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-md bg-[color:var(--color-pastel-cream)]/60 px-2 py-1 font-mono text-xs font-semibold",
                  disabled && "line-through",
                )}
              >
                {coupon.maCode}
              </span>
              <span
                className={cn(
                  "font-serif text-lg",
                  disabled && "line-through text-[color:var(--color-muted)]",
                )}
              >
                −{Number(coupon.phanTramGiam)}%
              </span>
            </div>
            <p className="mt-2 text-xs text-[color:var(--color-muted)]">
              Hiệu lực: {new Date(coupon.startAt).toLocaleDateString("vi-VN")}
              {" → "}
              {new Date(coupon.endAt).toLocaleDateString("vi-VN")}
            </p>
            <p className="text-xs text-[color:var(--color-muted)]">
              {coupon.soLuong == null
                ? "Không giới hạn lượt"
                : `Còn ${Math.max(0, (coupon.conLai ?? 0))}/${coupon.soLuong} lượt`}
            </p>
          </div>
          {reason && (
            <span className="shrink-0 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-rose-700">
              {reason}
            </span>
          )}
          {!disabled && isSelected && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-700">
              Đã chọn
            </span>
          )}
        </div>
      </button>
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[color:var(--color-muted)]">{label}</span>
      <span>{value}</span>
    </div>
  );
}

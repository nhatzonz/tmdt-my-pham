"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { Check } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABEL,
  orderApi,
  type Order,
  type OrderStatus,
} from "@/features/don-hang/api";
import { imageUrl, pastelBg } from "@/features/san-pham/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDateTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderApi
      .getById(id)
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Lỗi tải đơn"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    if (!order) return;
    if (!window.confirm(`Huỷ đơn LM-${String(order.id).padStart(6, "0")}? Hệ thống sẽ hoàn lại sản phẩm về kho.`)) {
      return;
    }
    setCancelling(true);
    setError(null);
    try {
      const updated = await orderApi.cancel(order.id);
      setOrder(updated);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không thể huỷ đơn");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-4/5 px-6 py-20 text-center text-sm text-[color:var(--color-muted)]">
        Đang tải đơn hàng...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-serif text-3xl">Không tìm thấy đơn hàng</h1>
        <p className="mt-3 text-sm text-rose-700">{error ?? "Không có dữ liệu"}</p>
        <Link href="/don-hang" className="mt-6 inline-block">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.lineTotal, 0);
  const discount =
    order.phanTramGiam !== undefined && order.phanTramGiam > 0
      ? Math.round((subtotal * order.phanTramGiam) / 100)
      : 0;

  return (
    <div className="mx-auto w-4/5 px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Đơn hàng của tôi", href: "/don-hang" },
          { label: `LM-${String(order.id).padStart(6, "0")}` },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">
            Đơn hàng LM-{String(order.id).padStart(6, "0")}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Đặt lúc {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.trangThai === "PENDING" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={cancelling}
              className="border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-700"
            >
              {cancelling ? "Đang huỷ..." : "Huỷ đơn"}
            </Button>
          )}
          <Link href="/don-hang">
            <Button variant="outline" size="sm">
              ← Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
        {order.trangThai === "CANCELLED" ? (
          <p className="text-sm text-rose-700">
            ✕ Đơn hàng đã huỷ — {ORDER_STATUS_LABEL.CANCELLED}
          </p>
        ) : (
          <Timeline current={order.trangThai} />
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <h2 className="mb-4 font-medium">Sản phẩm ({order.items.length})</h2>
          <div className="divide-y divide-[color:var(--color-border)]">
            {order.items.map((item) => {
              const img = imageUrl(item.hinhAnh);
              return (
                <div key={item.id} className="flex items-start gap-4 py-4">
                  <Link
                    href={`/san-pham/${item.sanPhamId}`}
                    className={cn(
                      "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl",
                      pastelBg(item.sanPhamId),
                    )}
                  >
                    {img ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img}
                        alt={item.tenSanPham}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-6 rounded bg-white/80" />
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/san-pham/${item.sanPhamId}`}
                      className="font-medium hover:underline"
                    >
                      {item.tenSanPham}
                    </Link>
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                      {formatCurrency(item.giaBan)} × {item.soLuong}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-xl">
                      {formatCurrency(item.lineTotal)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="flex h-fit flex-col gap-5 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <h2 className="font-medium">Tóm tắt</h2>

          <div>
            <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Địa chỉ giao
            </p>
            <p className="mt-1 text-sm">{order.diaChiGiao}</p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Phương thức thanh toán
            </p>
            <p className="mt-1 text-sm">{order.phuongThucTt}</p>
          </div>

          <div className="flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-4 text-sm">
            <Row label="Tạm tính" value={formatCurrency(subtotal)} />
            {discount > 0 && (
              <Row
                label={`Giảm giá ${order.maCoupon} (-${order.phanTramGiam}%)`}
                value={`-${formatCurrency(discount)}`}
                valueClass="text-rose-600"
              />
            )}
            <Row label="Vận chuyển" value="Miễn phí" />
          </div>

          <div className="flex items-baseline justify-between border-t border-[color:var(--color-border)] pt-4">
            <span className="text-sm">Tổng đã trả</span>
            <span className="font-serif text-2xl">
              {formatCurrency(order.tongTien)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Timeline({ current }: { current: OrderStatus }) {
  const flow = ORDER_STATUS_FLOW;
  const currentIdx = flow.indexOf(current);
  return (
    <ol className="flex items-center justify-between gap-4">
      {flow.map((step, idx) => {
        const done = idx <= currentIdx;
        return (
          <li key={step} className="flex flex-1 items-center gap-3">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-xs",
                done
                  ? "bg-[color:var(--color-ink)] text-white"
                  : "bg-[color:var(--color-ivory-2)] text-[color:var(--color-muted)]",
              )}
            >
              {done ? <Check className="size-4" /> : idx + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                done
                  ? "font-medium text-[color:var(--color-ink)]"
                  : "text-[color:var(--color-muted)]",
              )}
            >
              {ORDER_STATUS_LABEL[step]}
            </span>
            {idx < flow.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1",
                  done && idx < currentIdx
                    ? "bg-[color:var(--color-ink)]"
                    : "bg-[color:var(--color-border)]",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
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

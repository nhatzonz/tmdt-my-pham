"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  adminOrderApi,
  type AdminOrder,
} from "@/features/don-hang/admin-api";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/features/don-hang/api";
import { imageUrl, pastelBg } from "@/features/san-pham/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useToast } from "@/lib/toast";

type PageProps = {
  params: Promise<{ id: string }>;
};

const NEXT_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export default function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const toast = useToast();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<OrderStatus | null>(null);

  useEffect(() => {
    adminOrderApi
      .getById(id)
      .then(setOrder)
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : "Lỗi tải đơn"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdateStatus(next: OrderStatus) {
    if (!order) return;
    if (next === "CANCELLED") {
      const ok = window.confirm(
        `Huỷ đơn #${order.id}? Hệ thống sẽ tự hoàn ${order.soLuongMon} sản phẩm về kho.`,
      );
      if (!ok) return;
    }
    setUpdating(next);
    try {
      const updated = await adminOrderApi.updateStatus(order.id, next);
      setOrder(updated);
      toast.success(
        `Đã chuyển → ${ORDER_STATUS_LABEL[next]}`,
        `Đơn LM-${String(updated.id).padStart(6, "0")}`,
      );
    } catch (e) {
      toast.error(
        "Không thể cập nhật",
        e instanceof ApiError ? e.message : "Lỗi không xác định",
      );
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-[color:var(--color-muted)]">
        Đang tải...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-2xl">Không tìm thấy đơn</h1>
        <p className="mt-3 text-sm text-rose-700">{loadError}</p>
        <Link href="/quan-tri/don-hang" className="mt-6 inline-block">
          <Button variant="outline">← Quay lại</Button>
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.lineTotal, 0);
  const discount =
    order.phanTramGiam !== undefined && order.phanTramGiam > 0
      ? Math.round((subtotal * order.phanTramGiam) / 100)
      : 0;
  const transitions = NEXT_TRANSITIONS[order.trangThai];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/quan-tri/don-hang"
            className="text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            ← Đơn hàng
          </Link>
          <h1 className="mt-1 font-serif text-3xl md:text-4xl">
            Đơn LM-{String(order.id).padStart(6, "0")}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Đặt lúc {formatDateTime(order.createdAt)} · {order.soLuongMon} sản phẩm
          </p>
        </div>
        <StatusBadge status={order.trangThai} />
      </div>

      {transitions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
          <span className="text-xs font-medium uppercase tracking-widest text-[color:var(--color-muted)]">
            Chuyển trạng thái
          </span>
          {transitions.map((next) => {
            const isCancel = next === "CANCELLED";
            return (
              <Button
                key={next}
                variant={isCancel ? "outline" : "primary"}
                size="sm"
                onClick={() => handleUpdateStatus(next)}
                disabled={updating !== null}
                className={cn(
                  isCancel && "border-rose-300 text-rose-700 hover:bg-rose-50",
                )}
              >
                {updating === next
                  ? "Đang xử lý..."
                  : `→ ${ORDER_STATUS_LABEL[next]}`}
              </Button>
            );
          })}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <h2 className="mb-4 font-medium">Sản phẩm</h2>
          <div className="divide-y divide-[color:var(--color-border)]">
            {order.items.map((item) => {
              const img = imageUrl(item.hinhAnh);
              return (
                <div key={item.id} className="flex items-start gap-4 py-4">
                  <div
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
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.tenSanPham}</p>
                    <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                      {formatCurrency(item.giaBan)} × {item.soLuong}
                    </p>
                  </div>
                  <div className="font-serif text-lg">
                    {formatCurrency(item.lineTotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="flex h-fit flex-col gap-5 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <div>
            <h2 className="font-medium">Khách hàng</h2>
            <p className="mt-2 text-sm">{order.khachHoTen}</p>
            {order.khachEmail && (
              <p className="text-xs text-[color:var(--color-muted)]">
                {order.khachEmail}
              </p>
            )}
            {order.khachSoDienThoai && (
              <p className="text-xs text-[color:var(--color-muted)]">
                {order.khachSoDienThoai}
              </p>
            )}
          </div>

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
                label={`Giảm ${order.maCoupon} (-${order.phanTramGiam}%)`}
                value={`-${formatCurrency(discount)}`}
                valueClass="text-rose-600"
              />
            )}
            <Row label="Vận chuyển" value="Miễn phí" />
          </div>

          <div className="flex items-baseline justify-between border-t border-[color:var(--color-border)] pt-4">
            <span className="text-sm">Tổng</span>
            <span className="font-serif text-2xl">
              {formatCurrency(order.tongTien)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const tone =
    status === "SHIPPING"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "PENDING"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : status === "CANCELLED"
          ? "bg-rose-50 text-rose-700 ring-rose-200"
          : "bg-[color:var(--color-ivory-2)] text-[color:var(--color-ink)] ring-[color:var(--color-border)]";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-sm ring-1",
        tone,
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
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

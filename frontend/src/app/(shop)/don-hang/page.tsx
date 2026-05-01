"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterPill } from "@/components/ui/FilterPill";
import {
  ORDER_STATUS_LABEL,
  orderApi,
  type Order,
  type OrderStatus,
} from "@/features/don-hang/api";
import { imageUrl, pastelBg } from "@/features/san-pham/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/format";

const FILTER_OPTIONS: ({ value: OrderStatus | "ALL"; label: string })[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "COMPLETED", label: "Đã hoàn tất" },
  { value: "CANCELLED", label: "Đã huỷ" },
];

export default function DonHangPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  useEffect(() => {
    orderApi
      .mine()
      .then(setOrders)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Lỗi tải đơn"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full px-4 py-12 text-center text-sm text-[color:var(--color-muted)] md:w-4/5 md:px-6 md:py-20">
        Đang tải đơn hàng...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-serif text-4xl md:text-5xl">Đơn hàng của tôi</h1>
        <p className="mt-4 text-sm text-[color:var(--color-muted)]">
          Bạn chưa có đơn hàng nào.
        </p>
        <Link href="/san-pham" className="mt-8 inline-block">
          <Button size="lg">Mua sắm ngay</Button>
        </Link>
      </div>
    );
  }

  const counts: Record<OrderStatus | "ALL", number> = {
    ALL: orders.length,
    PENDING: 0,
    SHIPPING: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };
  for (const o of orders) counts[o.trangThai]++;

  const filtered =
    filter === "ALL" ? orders : orders.filter((o) => o.trangThai === filter);

  return (
    <div className="mx-auto w-full px-4 py-6 md:w-4/5 md:px-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Đơn hàng của tôi</h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Lịch sử {orders.length} đơn
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((o) => (
            <FilterPill
              key={o.value}
              active={filter === o.value}
              onClick={() => setFilter(o.value)}
            >
              {o.label} ({counts[o.value]})
            </FilterPill>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {filtered.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-white/50 p-12 text-center text-sm text-[color:var(--color-muted)]">
            Không có đơn ở trạng thái này.
          </p>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const status = order.trangThai;
  const tone =
    status === "SHIPPING"
      ? { label: "text-emerald-700", dot: "bg-emerald-500" }
      : status === "PENDING"
        ? { label: "text-amber-700", dot: "bg-amber-500" }
        : status === "CANCELLED"
          ? { label: "text-rose-700", dot: "bg-rose-500" }
          : {
              label: "text-[color:var(--color-ink)]",
              dot: "bg-[color:var(--color-ink)]",
            };

  return (
    <article className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
      <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <Field label="Mã đơn" value={`LM-${String(order.id).padStart(6, "0")}`} />
        <Field label="Ngày đặt" value={formatDate(order.createdAt)} />
        <Field
          label="Trạng thái"
          value={
            <span className={cn("inline-flex items-center gap-1.5", tone.label)}>
              <span className={cn("size-1.5 rounded-full", tone.dot)} />
              {ORDER_STATUS_LABEL[status]}
            </span>
          }
        />
        <Field label="Tổng" value={formatCurrency(order.tongTien)} big />
        <div className="col-span-2 flex gap-2 sm:col-span-1">
          <Link href={`/don-hang/${order.id}`}>
            <Button variant="outline" size="sm">
              Xem chi tiết
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-[color:var(--color-border)] pt-4">
        <div className="flex -space-x-2">
          {order.items.slice(0, 4).map((item) => {
            const img = imageUrl(item.hinhAnh);
            return (
              <div
                key={item.id}
                className={cn(
                  "flex size-10 items-center justify-center overflow-hidden rounded-lg ring-2 ring-white",
                  pastelBg(item.sanPhamId),
                )}
              >
                {img ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={img} alt={item.tenSanPham} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-6 w-2.5 rounded bg-white/80" />
                )}
              </div>
            );
          })}
        </div>
        <span className="text-xs text-[color:var(--color-muted)]">
          {order.items.length} sản phẩm
        </span>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  big,
}: {
  label: string;
  value: React.ReactNode;
  big?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[color:var(--color-ink)]",
          big ? "font-serif text-xl" : "text-sm",
        )}
      >
        {value}
      </p>
    </div>
  );
}

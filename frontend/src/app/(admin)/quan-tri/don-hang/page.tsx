"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { FilterPill } from "@/components/ui/FilterPill";
import {
  adminOrderApi,
  type AdminOrder,
} from "@/features/don-hang/admin-api";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/features/don-hang/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDateTime } from "@/lib/format";

type Filter = OrderStatus | "ALL";

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "COMPLETED", label: "Đã hoàn tất" },
  { value: "CANCELLED", label: "Đã huỷ" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");

  useEffect(() => {
    setLoading(true);
    adminOrderApi
      .list()
      .then(setOrders)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Lỗi tải đơn hàng"))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      ALL: orders.length,
      PENDING: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const o of orders) c[o.trangThai]++;
    return c;
  }, [orders]);

  const filtered = useMemo(
    () => (filter === "ALL" ? orders : orders.filter((o) => o.trangThai === filter)),
    [orders, filter],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Đơn hàng</h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Quản lý {orders.length} đơn — chuyển trạng thái, huỷ và hoàn kho.
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

      <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-[color:var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--color-ivory-2)] text-left text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Khách</th>
              <th className="px-4 py-3">Ngày đặt</th>
              <th className="px-4 py-3 text-right">Tổng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-border)]">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[color:var(--color-muted)]">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[color:var(--color-muted)]">
                  Không có đơn ở trạng thái này.
                </td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr key={o.id} className="transition hover:bg-[color:var(--color-ivory-2)]/50">
                <td className="px-4 py-3 font-mono text-xs text-[color:var(--color-ink)]">
                  LM-{String(o.id).padStart(6, "0")}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{o.khachHoTen}</div>
                  <div className="text-xs text-[color:var(--color-muted)]">
                    {o.khachSoDienThoai ?? o.khachEmail ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-[color:var(--color-muted)]">
                  {formatDateTime(o.createdAt)}
                </td>
                <td className="px-4 py-3 text-right font-serif text-base">
                  {formatCurrency(o.tongTien)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.trangThai} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/quan-tri/don-hang/${o.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-ink)] transition hover:opacity-70"
                  >
                    Chi tiết
                    <ArrowRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1",
        tone,
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

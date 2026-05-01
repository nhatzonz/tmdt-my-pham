"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShoppingBag, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterPill } from "@/components/ui/FilterPill";
import {
  inventoryApi,
  type InventoryHistoryRow,
  type InventoryLogAction,
} from "@/features/ton-kho/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { useToast } from "@/lib/toast";

const ACTION_LABEL: Record<InventoryLogAction, string> = {
  IMPORT: "Nhập",
  EXPORT: "Xuất",
  SET: "Đặt",
  ORDER: "Đơn hàng",
};

type Filter = "ALL" | InventoryLogAction;

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "IMPORT", label: "Nhập kho" },
  { value: "EXPORT", label: "Xuất kho" },
  { value: "SET", label: "Đặt cứng" },
  { value: "ORDER", label: "Đơn hàng" },
];

export default function InventoryHistoryPage() {
  const toast = useToast();
  const [rows, setRows] = useState<InventoryHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");

  useEffect(() => {
    inventoryApi
      .listHistory()
      .then(setRows)
      .catch((err) =>
        toast.error(
          "Lỗi tải lịch sử",
          err instanceof ApiError ? err.message : "Lỗi không xác định",
        ),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      ALL: rows.length,
      IMPORT: 0,
      EXPORT: 0,
      SET: 0,
      ORDER: 0,
    };
    for (const r of rows) c[r.action]++;
    return c;
  }, [rows]);

  const filtered = filter === "ALL" ? rows : rows.filter((r) => r.action === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Lịch sử kho</h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Audit log mọi thay đổi tồn kho — nhập / xuất / đặt / đơn hàng.
          </p>
        </div>
        <Link href="/quan-tri/ton-kho">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4" /> Về tồn kho
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
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

      {loading ? (
        <p className="mt-8 text-sm text-[color:var(--color-muted)]">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-[color:var(--color-border)] bg-white/50 p-12 text-center text-sm text-[color:var(--color-muted)]">
          Chưa có lịch sử ở nhóm này.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-[color:var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-ivory-2)]/40 text-left text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                <th className="p-4">Thời gian</th>
                <th className="p-4">Thao tác</th>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">SL</th>
                <th className="p-4">Trước → Sau</th>
                <th className="p-4">Δ</th>
                <th className="p-4">Người</th>
                <th className="p-4">Nguồn</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-[color:var(--color-ivory-2)]/20"
                >
                  <td className="p-4 text-xs text-[color:var(--color-muted)]">
                    {formatDateTime(h.createdAt)}
                  </td>
                  <td className="p-4">
                    <ActionBadge action={h.action} />
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/san-pham/${h.sanPhamId}`}
                      className="font-medium hover:underline"
                    >
                      {h.tenSanPham}
                    </Link>
                    <p className="text-xs text-[color:var(--color-muted)]">
                      {h.maSanPham ?? `#${h.sanPhamId}`}
                    </p>
                  </td>
                  <td className="p-4 font-medium">{h.soLuong}</td>
                  <td className="p-4 font-mono text-xs">
                    {h.tonTruoc} → <span className="font-medium">{h.tonSau}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "font-mono text-xs font-medium",
                        h.delta > 0
                          ? "text-emerald-600"
                          : h.delta < 0
                            ? "text-rose-600"
                            : "text-[color:var(--color-muted)]",
                      )}
                    >
                      {h.delta > 0 ? "+" : ""}
                      {h.delta}
                    </span>
                  </td>
                  <td className="p-4 text-xs">
                    {h.nguoiDungHoTen ?? (
                      <span className="text-[color:var(--color-muted)]">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <NguonChip nguon={h.nguon} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActionBadge({ action }: { action: InventoryLogAction }) {
  const cfg = {
    IMPORT: {
      cls: "bg-emerald-50 text-emerald-700",
      icon: <TrendingUp className="size-3" />,
    },
    EXPORT: {
      cls: "bg-rose-50 text-rose-700",
      icon: <TrendingDown className="size-3" />,
    },
    SET: {
      cls: "bg-[color:var(--color-ivory-2)] text-[color:var(--color-ink-soft)]",
      icon: <span className="text-[10px]">=</span>,
    },
    ORDER: {
      cls: "bg-[color:var(--color-pastel-blush)] text-[color:var(--color-ink-soft)]",
      icon: <ShoppingBag className="size-3" />,
    },
  }[action];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        cfg.cls,
      )}
    >
      {cfg.icon}
      {ACTION_LABEL[action]}
    </span>
  );
}

function NguonChip({ nguon }: { nguon?: string }) {
  if (!nguon) return <span className="text-xs text-[color:var(--color-muted)]">—</span>;

  // Admin context — link tới /quan-tri/don-hang/{id}, không phải route khách hàng.
  const orderRef =
    nguon.startsWith("don_hang_")
      ? { id: nguon.slice("don_hang_".length), label: "Đơn" }
      : nguon.startsWith("huy_don_")
        ? { id: nguon.slice("huy_don_".length), label: "Huỷ đơn" }
        : null;

  if (orderRef) {
    return (
      <Link
        href={`/quan-tri/don-hang/${orderRef.id}`}
        className="inline-flex items-center rounded-md bg-[color:var(--color-pastel-blush)]/40 px-2 py-1 text-xs text-[color:var(--color-ink-soft)] hover:underline"
      >
        {orderRef.label} #{orderRef.id}
      </Link>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md bg-[color:var(--color-ivory-2)] px-2 py-1 text-xs text-[color:var(--color-ink-soft)]">
      {nguon}
    </span>
  );
}

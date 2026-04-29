"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, History, Minus, Plus, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterPill } from "@/components/ui/FilterPill";
import { imageUrl } from "@/features/san-pham/api";
import {
  inventoryApi,
  type InventoryAction,
  type InventoryRow,
} from "@/features/ton-kho/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";

type FilterTab = "ALL" | "WARN" | "OUT";

export default function AdminTonKhoPage() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [thresholdEditing, setThresholdEditing] = useState<number | null>(null);
  const [thresholdInput, setThresholdInput] = useState<string>("");

  // Per-row qty input
  const [qtyMap, setQtyMap] = useState<Record<number, string>>({});

  async function load() {
    try {
      setError(null);
      const data = await inventoryApi.listAdmin();
      setRows(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi tải tồn kho");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const out = rows.filter((r) => r.hetHang).length;
    const warn = rows.filter((r) => r.canhBao && !r.hetHang).length;
    return { all: rows.length, warn, out };
  }, [rows]);

  const filtered = rows.filter((r) => {
    if (filter === "OUT") return r.hetHang;
    if (filter === "WARN") return r.canhBao && !r.hetHang;
    return true;
  });

  async function handleAction(row: InventoryRow, action: InventoryAction) {
    const raw = qtyMap[row.sanPhamId] ?? "";
    const qty = Number(raw);
    if (!Number.isFinite(qty) || qty < 0 || (action !== "SET" && qty <= 0)) {
      setError("Số lượng không hợp lệ");
      return;
    }
    setBusyId(row.sanPhamId);
    setError(null);
    try {
      await inventoryApi.update({
        sanPhamId: row.sanPhamId,
        action,
        soLuong: qty,
      });
      setQtyMap((m) => ({ ...m, [row.sanPhamId]: "" }));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi cập nhật");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveThreshold(row: InventoryRow) {
    const v = Number(thresholdInput);
    if (!Number.isFinite(v) || v < 0) {
      setError("Ngưỡng không hợp lệ");
      return;
    }
    setBusyId(row.sanPhamId);
    setError(null);
    try {
      await inventoryApi.updateThreshold({
        sanPhamId: row.sanPhamId,
        nguongCanhBao: v,
      });
      setThresholdEditing(null);
      setThresholdInput("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi cập nhật ngưỡng");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Tồn kho</h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Nhập / xuất / đặt số tồn kho. Cảnh báo tự động khi dưới ngưỡng.
          </p>
        </div>
        <Link href="/quan-tri/ton-kho/lich-su">
          <Button variant="outline" size="sm">
            <History className="size-4" /> Lịch sử kho
          </Button>
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterPill active={filter === "ALL"} onClick={() => setFilter("ALL")}>
          Tất cả ({counts.all})
        </FilterPill>
        <FilterPill active={filter === "WARN"} onClick={() => setFilter("WARN")}>
          Sắp hết ({counts.warn})
        </FilterPill>
        <FilterPill active={filter === "OUT"} onClick={() => setFilter("OUT")}>
          Hết hàng ({counts.out})
        </FilterPill>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-[color:var(--color-muted)]">Đang tải...</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-[color:var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-ivory-2)]/40 text-left text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                <th className="p-4">Ảnh</th>
                <th className="p-4">Mã / Tên SP</th>
                <th className="p-4">Tồn</th>
                <th className="p-4">Ngưỡng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const img = imageUrl(row.hinhAnh);
                const qty = qtyMap[row.sanPhamId] ?? "";
                const busy = busyId === row.sanPhamId;
                const editing = thresholdEditing === row.sanPhamId;
                return (
                  <tr
                    key={row.sanPhamId}
                    className="border-b border-[color:var(--color-border)] last:border-0"
                  >
                    <td className="p-4">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={row.tenSanPham}
                          className="size-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="size-12 rounded-md bg-[color:var(--color-ivory-2)]" />
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{row.tenSanPham}</p>
                      <p className="text-xs text-[color:var(--color-muted)]">
                        {row.maSanPham ?? `#${row.sanPhamId}`}
                        {row.thuongHieu ? ` · ${row.thuongHieu}` : ""}
                      </p>
                    </td>
                    <td className="p-4 font-serif text-xl">{row.soLuongTon}</td>
                    <td className="p-4">
                      {editing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={thresholdInput}
                            onChange={(e) => setThresholdInput(e.target.value)}
                            className="w-20 rounded-md border border-[color:var(--color-border)] px-2 py-1 text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveThreshold(row)}
                            disabled={busy}
                            className="rounded-md bg-[color:var(--color-ink)] px-2 py-1 text-xs text-white"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setThresholdEditing(null);
                              setThresholdInput("");
                            }}
                            className="rounded-md p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-ivory-2)]"
                            aria-label="Huỷ"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setThresholdEditing(row.sanPhamId);
                            setThresholdInput(String(row.nguongCanhBao));
                          }}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-[color:var(--color-ink-soft)] transition hover:bg-[color:var(--color-ivory-2)]"
                          title="Đổi ngưỡng cảnh báo"
                        >
                          {row.nguongCanhBao}
                          <Settings2 className="size-3 opacity-50" />
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      {row.hetHang ? (
                        <Badge tone="rose" icon={<AlertTriangle className="size-3" />}>
                          Hết hàng
                        </Badge>
                      ) : row.canhBao ? (
                        <Badge tone="amber" icon={<AlertTriangle className="size-3" />}>
                          Sắp hết
                        </Badge>
                      ) : (
                        <Badge tone="mint">Còn hàng</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={qty}
                          onChange={(e) =>
                            setQtyMap((m) => ({
                              ...m,
                              [row.sanPhamId]: e.target.value,
                            }))
                          }
                          placeholder="SL"
                          className="w-20 rounded-md border border-[color:var(--color-border)] px-2 py-1.5 text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <ActionButton
                          onClick={() => handleAction(row, "IMPORT")}
                          disabled={busy}
                          icon={<Plus className="size-3.5" />}
                          label="Nhập"
                          tone="emerald"
                        />
                        <ActionButton
                          onClick={() => handleAction(row, "EXPORT")}
                          disabled={busy}
                          icon={<Minus className="size-3.5" />}
                          label="Xuất"
                          tone="rose"
                        />
                        <ActionButton
                          onClick={() => handleAction(row, "SET")}
                          disabled={busy}
                          icon={<span className="text-xs">=</span>}
                          label="Đặt"
                          tone="ink"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm text-[color:var(--color-muted)]">
                    Không có sản phẩm trong nhóm này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Badge({
  tone,
  icon,
  children,
}: {
  tone: "rose" | "amber" | "mint";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const cls = {
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    mint: "bg-[color:var(--color-pastel-mint)] text-[color:var(--color-ink-soft)]",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        cls,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

function ActionButton({
  onClick,
  disabled,
  icon,
  label,
  tone,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  tone: "emerald" | "rose" | "ink";
}) {
  const cls = {
    emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    rose: "bg-rose-50 text-rose-700 hover:bg-rose-100",
    ink: "bg-[color:var(--color-ivory-2)] text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-ink)] hover:text-white",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50",
        cls,
      )}
    >
      {icon}
      {label}
    </button>
  );
}

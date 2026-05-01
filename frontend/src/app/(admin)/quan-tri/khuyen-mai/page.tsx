"use client";

import { useEffect, useState } from "react";
import { Pencil, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterPill } from "@/components/ui/FilterPill";
import { Input } from "@/components/ui/Input";
import {
  couponApi,
  type Coupon,
  type CouponStatus,
} from "@/features/khuyen-mai/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { subscribeCoupons } from "@/lib/coupon-socket";
import { formatDateTime } from "@/lib/format";
import { useToast } from "@/lib/toast";

type FormState = {
  maCode: string;
  phanTramGiam: string;
  startAt: string;
  endAt: string;
  status: CouponStatus;
  soLuong: string;
};

const INITIAL_FORM: FormState = {
  maCode: "",
  phanTramGiam: "",
  startAt: "",
  endAt: "",
  status: "ACTIVE",
  soLuong: "",
};

type Filter = "ALL" | "LIVE" | "INACTIVE" | "EXPIRED";

export default function AdminCouponPage() {
  const toast = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<Filter>("ALL");

  async function load() {
    try {
      setCoupons(await couponApi.listAdmin());
    } catch (err) {
      toast.error(
        "Lỗi tải mã giảm giá",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
    }
  }

  useEffect(() => {
    load();

    return subscribeCoupons(() => {
      load();
    });
  }, []);

  function startEdit(c: Coupon) {
    setEditingId(c.id);
    setForm({
      maCode: c.maCode,
      phanTramGiam: String(c.phanTramGiam),
      startAt: isoToLocal(c.startAt),
      endAt: isoToLocal(c.endAt),
      status: c.status,
      soLuong: c.soLuong != null ? String(c.soLuong) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(INITIAL_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.startAt || !form.endAt) {
      toast.error("Thiếu ngày", "Vui lòng chọn ngày bắt đầu / kết thúc");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        maCode: form.maCode.trim().toUpperCase(),
        phanTramGiam: Number(form.phanTramGiam),
        startAt: localToIso(form.startAt),
        endAt: localToIso(form.endAt),
        status: form.status,
        soLuong: form.soLuong.trim() === "" ? null : Number(form.soLuong),
      };
      if (body.soLuong !== null && (!Number.isInteger(body.soLuong) || body.soLuong < 1)) {
        toast.error("Số lượng không hợp lệ", "Số lượng phải là số nguyên ≥ 1");
        setSubmitting(false);
        return;
      }
      if (editingId !== null) {
        await couponApi.updateAdmin(editingId, body);
        toast.success("Đã cập nhật mã", body.maCode);
      } else {
        await couponApi.createAdmin(body);
        toast.success("Đã thêm mã", body.maCode);
      }
      cancelEdit();
      await load();
    } catch (err) {
      toast.error(
        "Không lưu được",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Xoá mã giảm giá này?")) return;
    try {
      await couponApi.deleteAdmin(id);
      if (editingId === id) cancelEdit();
      await load();
      toast.success("Đã xoá mã giảm giá");
    } catch (err) {
      toast.error(
        "Không thể xoá",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
    }
  }

  const now = Date.now();
  const counts = {
    ALL: coupons.length,
    LIVE: coupons.filter((c) => c.isLive).length,
    INACTIVE: coupons.filter((c) => c.status === "INACTIVE").length,
    EXPIRED: coupons.filter(
      (c) => c.status === "ACTIVE" && new Date(c.endAt).getTime() < now,
    ).length,
  };

  const filtered = coupons.filter((c) => {
    if (filter === "LIVE") return c.isLive;
    if (filter === "INACTIVE") return c.status === "INACTIVE";
    if (filter === "EXPIRED")
      return c.status === "ACTIVE" && new Date(c.endAt).getTime() < now;
    return true;
  });

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">Khuyến mãi</h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        Tạo / sửa / xoá mã giảm giá. Server tự kiểm tra khi customer áp dụng ở thanh toán.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[400px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="flex h-fit flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {editingId !== null ? `Sửa #${editingId}` : "Thêm mã giảm giá"}
            </h2>
            {editingId !== null && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs text-[color:var(--color-muted)] underline underline-offset-4"
              >
                Huỷ
              </button>
            )}
          </div>

          <Input
            name="maCode"
            label="Mã code"
            placeholder="vd: SALE25"
            value={form.maCode}
            onChange={(e) => setForm({ ...form, maCode: e.target.value })}
            required
            minLength={2}
            maxLength={50}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="phanTramGiam"
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              label="Phần trăm giảm (%)"
              value={form.phanTramGiam}
              onChange={(e) => setForm({ ...form, phanTramGiam: e.target.value })}
              required
            />
            <Input
              name="soLuong"
              type="number"
              step="1"
              min="1"
              label="Số lượng (bỏ trống = không giới hạn)"
              placeholder="VD: 100"
              value={form.soLuong}
              onChange={(e) => setForm({ ...form, soLuong: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DateTimeField
              label="Bắt đầu"
              value={form.startAt}
              onChange={(v) => setForm({ ...form, startAt: v })}
            />
            <DateTimeField
              label="Kết thúc"
              value={form.endAt}
              onChange={(v) => setForm({ ...form, endAt: v })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Trạng thái <span className="text-rose-600">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as CouponStatus })
              }
              className="rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm"
            >
              <option value="ACTIVE">ACTIVE — đang hoạt động</option>
              <option value="INACTIVE">INACTIVE — tạm dừng</option>
            </select>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting
              ? editingId !== null
                ? "Đang lưu..."
                : "Đang tạo..."
              : editingId !== null
                ? "Lưu thay đổi"
                : "Tạo mã giảm giá"}
          </Button>
        </form>

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <FilterPill active={filter === "ALL"} onClick={() => setFilter("ALL")}>
              Tất cả ({counts.ALL})
            </FilterPill>
            <FilterPill active={filter === "LIVE"} onClick={() => setFilter("LIVE")}>
              Đang hiệu lực ({counts.LIVE})
            </FilterPill>
            <FilterPill
              active={filter === "INACTIVE"}
              onClick={() => setFilter("INACTIVE")}
            >
              Tạm dừng ({counts.INACTIVE})
            </FilterPill>
            <FilterPill
              active={filter === "EXPIRED"}
              onClick={() => setFilter("EXPIRED")}
            >
              Hết hạn ({counts.EXPIRED})
            </FilterPill>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[color:var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-ivory-2)]/40 text-left text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  <th className="p-4">Mã</th>
                  <th className="p-4">Giảm</th>
                  <th className="p-4">Hiệu lực</th>
                  <th className="p-4">Số lượng</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[color:var(--color-border)] last:border-0"
                  >
                    <td className="p-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-pastel-cream)]/50 px-3 py-1 font-mono text-xs font-medium">
                        <Tag className="size-3" />
                        {c.maCode}
                      </div>
                      <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                        #{c.id}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="font-serif text-xl">−{Number(c.phanTramGiam)}%</span>
                    </td>
                    <td className="p-4 text-xs">
                      <p>{formatDateTime(c.startAt)}</p>
                      <p className="text-[color:var(--color-muted)]">
                        → {formatDateTime(c.endAt)}
                      </p>
                    </td>
                    <td className="p-4 text-xs">
                      {c.soLuong == null ? (
                        <span className="text-[color:var(--color-muted)]">∞</span>
                      ) : (
                        <span>
                          {c.daSuDung}/{c.soLuong}
                          <span className="ml-1 text-[color:var(--color-muted)]">
                            (còn {Math.max(0, c.soLuong - c.daSuDung)})
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge coupon={c} now={now} />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          aria-label="Sửa"
                          className="rounded-md p-1.5 text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-ivory-2)] hover:text-[color:var(--color-ink)]"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          aria-label="Xoá"
                          className="rounded-md p-1.5 text-[color:var(--color-muted)] transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-12 text-center text-sm text-[color:var(--color-muted)]"
                    >
                      Không có mã ở nhóm này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
        {label} <span className="text-rose-600">*</span>
      </label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-ink)]"
      />
    </div>
  );
}

function StatusBadge({ coupon, now }: { coupon: Coupon; now: number }) {
  const expired = new Date(coupon.endAt).getTime() < now;
  if (coupon.status === "INACTIVE") {
    return (
      <span className="inline-flex items-center rounded-full bg-[color:var(--color-ivory-2)] px-2.5 py-1 text-xs text-[color:var(--color-muted)]">
        Tạm dừng
      </span>
    );
  }
  if (expired) {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs text-rose-700">
        Hết hạn
      </span>
    );
  }
  if (coupon.isLive) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700",
        )}
      >
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Đang hiệu lực
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
      Chưa bắt đầu
    </span>
  );
}

function localToIso(local: string): string {
  return new Date(local).toISOString();
}

function isoToLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

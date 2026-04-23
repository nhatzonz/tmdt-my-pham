"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoryApi, type Category } from "@/features/danh-muc/api";
import { productApi, type LoaiDa, type Product } from "@/features/san-pham/api";
import { ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";

const LOAI_DA_OPTIONS: { value: LoaiDa; label: string }[] = [
  { value: "OILY", label: "Da dầu" },
  { value: "DRY", label: "Da khô" },
  { value: "COMBINATION", label: "Da hỗn hợp" },
  { value: "SENSITIVE", label: "Da nhạy cảm" },
  { value: "NORMAL", label: "Da thường" },
  { value: "ALL", label: "Tất cả" },
];

type FormState = {
  tenSanPham: string;
  gia: string;
  loaiDa: LoaiDa | "";
  danhMucId: string;
  moTa: string;
  thuongHieu: string;
};

const INITIAL_FORM: FormState = {
  tenSanPham: "",
  gia: "",
  loaiDa: "",
  danhMucId: "",
  moTa: "",
  thuongHieu: "",
};

export default function AdminSanPhamPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    try {
      setError(null);
      const [cats, prods] = await Promise.all([
        categoryApi.listAdmin(),
        productApi.listAdmin(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi không xác định");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.tenDanhMuc])),
    [categories],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.loaiDa || !form.danhMucId) return;
    setLoading(true);
    setError(null);
    try {
      await productApi.createAdmin({
        tenSanPham: form.tenSanPham,
        gia: Number(form.gia),
        loaiDa: form.loaiDa,
        danhMucId: Number(form.danhMucId),
        moTa: form.moTa || undefined,
        thuongHieu: form.thuongHieu || undefined,
      });
      setForm(INITIAL_FORM);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">Sản phẩm</h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        Tạo sản phẩm — loại da bắt buộc cho AI (UC 2.3.3).
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[400px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="flex h-fit flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]"
        >
          <h2 className="font-medium">Thêm sản phẩm</h2>

          <Input
            name="tenSanPham"
            label="Tên sản phẩm"
            value={form.tenSanPham}
            onChange={(e) => setForm({ ...form, tenSanPham: e.target.value })}
            required
            minLength={2}
          />

          <Input
            name="gia"
            type="number"
            label="Giá (VND)"
            value={form.gia}
            onChange={(e) => setForm({ ...form, gia: e.target.value })}
            required
            min="1"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Loại da <span className="text-rose-600">*</span>
            </label>
            <select
              required
              value={form.loaiDa}
              onChange={(e) =>
                setForm({ ...form, loaiDa: e.target.value as LoaiDa | "" })
              }
              className="rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-ink)]"
            >
              <option value="">— Chọn loại da —</option>
              {LOAI_DA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-[color:var(--color-muted)]">
              Input cho Module AI (Phase 3).
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Danh mục <span className="text-rose-600">*</span>
            </label>
            <select
              required
              value={form.danhMucId}
              onChange={(e) => setForm({ ...form, danhMucId: e.target.value })}
              className="rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-ink)]"
            >
              <option value="">— Chọn danh mục —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tenDanhMuc}
                </option>
              ))}
            </select>
          </div>

          <Input
            name="thuongHieu"
            label="Thương hiệu"
            value={form.thuongHieu}
            onChange={(e) => setForm({ ...form, thuongHieu: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Mô tả
            </label>
            <textarea
              value={form.moTa}
              onChange={(e) => setForm({ ...form, moTa: e.target.value })}
              rows={3}
              className="resize-none rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-ink)]"
            />
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo sản phẩm"}
          </Button>
        </form>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Danh sách ({products.length})</h2>
          </div>
          {products.length === 0 ? (
            <p className="text-sm text-[color:var(--color-muted)]">Chưa có sản phẩm nào.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-border)] text-left text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Tên</th>
                  <th className="pb-2">Giá</th>
                  <th className="pb-2">Loại da</th>
                  <th className="pb-2">Danh mục</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[color:var(--color-border)] last:border-0"
                  >
                    <td className="py-3 text-[color:var(--color-muted)]">#{p.id}</td>
                    <td className="py-3">{p.tenSanPham}</td>
                    <td className="py-3">{formatCurrency(p.gia)}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-[color:var(--color-ivory-2)] px-2 py-0.5 text-xs">
                        {p.loaiDa}
                      </span>
                    </td>
                    <td className="py-3">{catMap.get(p.danhMucId) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

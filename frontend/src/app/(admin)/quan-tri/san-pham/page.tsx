"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoryApi, type Category } from "@/features/danh-muc/api";
import {
  imageUrl,
  productApi,
  type LoaiDa,
  type Product,
} from "@/features/san-pham/api";
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
  hinhAnh: string;
};

const INITIAL_FORM: FormState = {
  tenSanPham: "",
  gia: "",
  loaiDa: "",
  danhMucId: "",
  moTa: "",
  thuongHieu: "",
  hinhAnh: "",
};

export default function AdminSanPhamPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await productApi.uploadImage(file);
      setForm((f) => ({ ...f, hinhAnh: result.url }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      tenSanPham: p.tenSanPham,
      gia: String(p.gia),
      loaiDa: p.loaiDa,
      danhMucId: String(p.danhMucId),
      moTa: p.moTa ?? "",
      thuongHieu: p.thuongHieu ?? "",
      hinhAnh: p.hinhAnh ?? "",
    });
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.loaiDa || !form.danhMucId) return;
    setSubmitting(true);
    setError(null);
    try {
      const reqBody = {
        tenSanPham: form.tenSanPham,
        gia: Number(form.gia),
        loaiDa: form.loaiDa,
        danhMucId: Number(form.danhMucId),
        moTa: form.moTa || undefined,
        thuongHieu: form.thuongHieu || undefined,
        hinhAnh: form.hinhAnh || undefined,
      };
      if (editingId !== null) {
        await productApi.updateAdmin(editingId, reqBody);
      } else {
        await productApi.createAdmin(reqBody);
      }
      setForm(INITIAL_FORM);
      setEditingId(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi không xác định");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Xoá sản phẩm này? Hành động không thể hoàn tác.")) return;
    try {
      await productApi.deleteAdmin(id);
      if (editingId === id) cancelEdit();
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi xoá");
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">Sản phẩm</h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        Tạo / sửa / xoá sản phẩm — loại da bắt buộc cho AI (UC 2.3.3).
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="flex h-fit flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {editingId !== null ? `Sửa #${editingId}` : "Thêm sản phẩm"}
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

          {/* Image upload */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Hình ảnh
            </label>
            {form.hinhAnh ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl(form.hinhAnh) ?? ""}
                  alt="Preview"
                  className="h-40 w-full rounded-lg border border-[color:var(--color-border)] object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, hinhAnh: "" })}
                  aria-label="Xoá ảnh"
                  className="absolute right-2 top-2 rounded-full bg-white p-1.5 shadow ring-1 ring-[color:var(--color-border)] hover:bg-rose-50"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-ivory-2)]/40 text-xs text-[color:var(--color-muted)] transition hover:border-[color:var(--color-ink)] hover:text-[color:var(--color-ink)] disabled:opacity-50"
              >
                <Upload className="size-5" />
                {uploading ? "Đang tải lên..." : "Chọn ảnh (JPEG/PNG/WEBP, ≤10MB)"}
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
          )}

          <Button type="submit" disabled={submitting || uploading}>
            {submitting
              ? editingId !== null
                ? "Đang lưu..."
                : "Đang tạo..."
              : editingId !== null
                ? "Lưu thay đổi"
                : "Tạo sản phẩm"}
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
                  <th className="pb-2">Ảnh</th>
                  <th className="pb-2">Tên</th>
                  <th className="pb-2">Giá</th>
                  <th className="pb-2">Loại da</th>
                  <th className="pb-2">Danh mục</th>
                  <th className="pb-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const img = imageUrl(p.hinhAnh);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-[color:var(--color-border)] last:border-0"
                    >
                      <td className="py-3">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={p.tenSanPham}
                            className="size-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="size-12 rounded-md bg-[color:var(--color-ivory-2)]" />
                        )}
                      </td>
                      <td className="py-3">
                        <p className="font-medium">{p.tenSanPham}</p>
                        <p className="text-xs text-[color:var(--color-muted)]">
                          #{p.id}
                        </p>
                      </td>
                      <td className="py-3">{formatCurrency(p.gia)}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-[color:var(--color-ivory-2)] px-2 py-0.5 text-xs">
                          {p.loaiDa}
                        </span>
                      </td>
                      <td className="py-3">{catMap.get(p.danhMucId) ?? "—"}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            aria-label="Sửa"
                            className="rounded-md p-1.5 text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-ivory-2)] hover:text-[color:var(--color-ink)]"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            aria-label="Xoá"
                            className="rounded-md p-1.5 text-[color:var(--color-muted)] transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

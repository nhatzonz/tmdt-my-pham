"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
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
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/lib/toast";

const LOAI_DA_OPTIONS: { value: LoaiDa; label: string }[] = [
  { value: "OILY", label: "Da dầu" },
  { value: "DRY", label: "Da khô" },
  { value: "COMBINATION", label: "Da hỗn hợp" },
  { value: "SENSITIVE", label: "Da nhạy cảm" },
  { value: "NORMAL", label: "Da thường" },
  { value: "ALL", label: "Tất cả" },
];

type FormState = {
  maSanPham: string;
  tenSanPham: string;
  gia: string;
  loaiDa: LoaiDa | "";
  danhMucId: string;
  moTa: string;
  thuongHieu: string;
  hinhAnh: string[];
};

const INITIAL_FORM: FormState = {
  maSanPham: "",
  tenSanPham: "",
  gia: "",
  loaiDa: "",
  danhMucId: "",
  moTa: "",
  thuongHieu: "",
  hinhAnh: [],
};

export default function AdminSanPhamPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function loadAll() {
    try {
      const [cats, prods] = await Promise.all([
        categoryApi.listAdmin(),
        productApi.listAdmin(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      toast.error(
        "Lỗi tải dữ liệu",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
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
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const result = await productApi.uploadImage(file);
        newUrls.push(result.url);
      }
      setForm((f) => ({ ...f, hinhAnh: [...f.hinhAnh, ...newUrls] }));
      toast.success(`Đã tải ${newUrls.length} ảnh lên`);
    } catch (err) {
      toast.error(
        "Upload thất bại",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, hinhAnh: f.hinhAnh.filter((_, i) => i !== idx) }));
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      maSanPham: p.maSanPham ?? "",
      tenSanPham: p.tenSanPham,
      gia: String(p.gia),
      loaiDa: p.loaiDa,
      danhMucId: String(p.danhMucId),
      moTa: p.moTa ?? "",
      thuongHieu: p.thuongHieu ?? "",
      hinhAnh: p.hinhAnh ?? [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(INITIAL_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.loaiDa || !form.danhMucId) return;
    setSubmitting(true);
    try {
      const reqBody = {
        maSanPham: form.maSanPham || undefined,
        tenSanPham: form.tenSanPham,
        gia: Number(form.gia),
        loaiDa: form.loaiDa,
        danhMucId: Number(form.danhMucId),
        moTa: form.moTa || undefined,
        thuongHieu: form.thuongHieu || undefined,
        hinhAnh: form.hinhAnh,
      };
      if (editingId !== null) {
        await productApi.updateAdmin(editingId, reqBody);
        toast.success("Đã cập nhật sản phẩm", form.tenSanPham);
      } else {
        await productApi.createAdmin(reqBody);
        toast.success("Đã thêm sản phẩm", form.tenSanPham);
      }
      setForm(INITIAL_FORM);
      setEditingId(null);
      await loadAll();
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
    if (!confirm("Xoá sản phẩm này? Toàn bộ ảnh sản phẩm cũng sẽ bị xoá.")) return;
    try {
      await productApi.deleteAdmin(id);
      if (editingId === id) cancelEdit();
      await loadAll();
      toast.success("Đã xoá sản phẩm");
    } catch (err) {
      toast.error(
        "Không thể xoá",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">Sản phẩm</h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        Tạo / sửa / xoá sản phẩm — loại da bắt buộc cho AI (UC 2.3.3). Hỗ trợ nhiều ảnh.
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
            name="maSanPham"
            label="Mã sản phẩm"
            placeholder="vd: NL-001 (tuỳ chọn)"
            value={form.maSanPham}
            onChange={(e) => setForm({ ...form, maSanPham: e.target.value })}
            maxLength={50}
          />

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

          {/* Multi-image gallery */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Hình ảnh ({form.hinhAnh.length})
            </label>
            {form.hinhAnh.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {form.hinhAnh.map((url, idx) => (
                  <div key={url} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl(url) ?? ""}
                      alt={`Ảnh ${idx + 1}`}
                      className="h-full w-full rounded-lg border border-[color:var(--color-border)] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      aria-label="Xoá ảnh"
                      className="absolute right-1 top-1 rounded-full bg-white p-1 shadow ring-1 ring-[color:var(--color-border)] hover:bg-rose-50"
                    >
                      <X className="size-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 rounded-full bg-[color:var(--color-ink)] px-2 py-0.5 text-[9px] uppercase tracking-wider text-white">
                        Chính
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-ivory-2)]/40 text-xs text-[color:var(--color-muted)] transition hover:border-[color:var(--color-ink)] hover:text-[color:var(--color-ink)] disabled:opacity-50"
            >
              <Plus className="size-5" />
              {uploading ? "Đang tải lên..." : "Thêm ảnh (chọn nhiều)"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

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
                  <th className="pb-2">Mã</th>
                  <th className="pb-2">Tên</th>
                  <th className="pb-2">Giá</th>
                  <th className="pb-2">Loại da</th>
                  <th className="pb-2">Danh mục</th>
                  <th className="pb-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const firstImg = imageUrl(p.hinhAnh?.[0]);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-[color:var(--color-border)] last:border-0"
                    >
                      <td className="py-3">
                        <div className="relative">
                          {firstImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={firstImg}
                              alt={p.tenSanPham}
                              className="size-12 rounded-md object-cover"
                            />
                          ) : (
                            <div className="size-12 rounded-md bg-[color:var(--color-ivory-2)]" />
                          )}
                          {p.hinhAnh.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 rounded-full bg-[color:var(--color-ink)] px-1.5 py-0.5 text-[9px] text-white">
                              +{p.hinhAnh.length - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-xs text-[color:var(--color-muted)]">
                        {p.maSanPham ?? "—"}
                      </td>
                      <td className="py-3">
                        <p className="font-medium">{p.tenSanPham}</p>
                        <p className="text-xs text-[color:var(--color-muted)]">#{p.id}</p>
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
                            className={cn(
                              "rounded-md p-1.5 text-[color:var(--color-muted)] transition hover:bg-rose-50 hover:text-rose-600",
                            )}
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

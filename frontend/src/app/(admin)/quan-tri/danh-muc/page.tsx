"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoryApi, type Category } from "@/features/danh-muc/api";
import { imageUrl, productApi } from "@/features/san-pham/api";
import { ApiError } from "@/lib/api-client";

type FormState = {
  tenDanhMuc: string;
  hinhAnh: string;
  thuTu: string;
};

const INITIAL_FORM: FormState = { tenDanhMuc: "", hinhAnh: "", thuTu: "" };

export default function AdminDanhMucPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function loadList() {
    try {
      setError(null);
      const data = await categoryApi.listAdmin();
      setCategories(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi không xác định");
    }
  }

  useEffect(() => {
    loadList();
  }, []);

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

  function startEdit(c: Category) {
    setEditingId(c.id);
    setForm({
      tenDanhMuc: c.tenDanhMuc,
      hinhAnh: c.hinhAnh ?? "",
      thuTu: String(c.thuTu),
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
    setSubmitting(true);
    setError(null);
    try {
      const reqBody = {
        tenDanhMuc: form.tenDanhMuc,
        hinhAnh: form.hinhAnh || undefined,
        thuTu: form.thuTu === "" ? undefined : Number(form.thuTu),
      };
      if (editingId !== null) {
        await categoryApi.updateAdmin(editingId, reqBody);
      } else {
        await categoryApi.createAdmin(reqBody);
      }
      setForm(INITIAL_FORM);
      setEditingId(null);
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi không xác định");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Xoá danh mục này? Sản phẩm tham chiếu sẽ lỗi nếu danh mục bị xoá."))
      return;
    try {
      await categoryApi.deleteAdmin(id);
      if (editingId === id) cancelEdit();
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi xoá");
    }
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const a = categories[index]!;
    const b = categories[target]!;
    setReordering(true);
    setError(null);
    try {
      await categoryApi.updateAdmin(a.id, {
        tenDanhMuc: a.tenDanhMuc,
        hinhAnh: a.hinhAnh,
        thuTu: b.thuTu,
      });
      await categoryApi.updateAdmin(b.id, {
        tenDanhMuc: b.tenDanhMuc,
        hinhAnh: b.hinhAnh,
        thuTu: a.thuTu,
      });
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi sắp xếp");
    } finally {
      setReordering(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">Danh mục</h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        Tạo / sửa / xoá danh mục — sắp xếp thứ tự hiển thị (mũi tên ▲▼ hoặc ô &quot;Thứ tự&quot;).
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[400px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="flex h-fit flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {editingId !== null ? `Sửa #${editingId}` : "Thêm danh mục"}
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
            name="tenDanhMuc"
            label="Tên danh mục"
            value={form.tenDanhMuc}
            onChange={(e) => setForm({ ...form, tenDanhMuc: e.target.value })}
            required
            minLength={2}
            maxLength={100}
          />

          <Input
            name="thuTu"
            type="number"
            min="0"
            label="Thứ tự (số nhỏ hiện trước)"
            value={form.thuTu}
            onChange={(e) => setForm({ ...form, thuTu: e.target.value })}
          />

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
                : "Tạo danh mục"}
          </Button>
        </form>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Danh sách ({categories.length})</h2>
            {reordering && (
              <span className="text-xs text-[color:var(--color-muted)]">
                Đang sắp xếp...
              </span>
            )}
          </div>
          {categories.length === 0 ? (
            <p className="text-sm text-[color:var(--color-muted)]">Chưa có danh mục nào.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-border)] text-left text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  <th className="pb-2">Thứ tự</th>
                  <th className="pb-2">Ảnh</th>
                  <th className="pb-2">Tên danh mục</th>
                  <th className="pb-2">Sản phẩm</th>
                  <th className="pb-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c, idx) => {
                  const img = imageUrl(c.hinhAnh);
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-[color:var(--color-border)] last:border-0"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveItem(idx, -1)}
                            disabled={idx === 0 || reordering}
                            aria-label="Lên"
                            className="rounded p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-ivory-2)] disabled:opacity-30"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(idx, 1)}
                            disabled={idx === categories.length - 1 || reordering}
                            aria-label="Xuống"
                            className="rounded p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-ivory-2)] disabled:opacity-30"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          <span className="ml-1 font-mono text-xs text-[color:var(--color-muted)]">
                            {c.thuTu}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={c.tenDanhMuc}
                            className="size-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="size-12 rounded-md bg-[color:var(--color-ivory-2)]" />
                        )}
                      </td>
                      <td className="py-3">
                        <p className="font-medium">{c.tenDanhMuc}</p>
                        <p className="text-xs text-[color:var(--color-muted)]">#{c.id}</p>
                      </td>
                      <td className="py-3 text-[color:var(--color-muted)]">
                        {c.productCount}
                      </td>
                      <td className="py-3">
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

"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { imageUrl, maLoiApi } from "@/features/ma-loi/api";
import { thietBiApi, type ThietBi } from "@/features/thiet-bi/api";
import { ApiError } from "@/lib/api-client";
import { useToast } from "@/lib/toast";

type FormState = {
  tenThietBi: string;
  hang: string;
  hinhAnh: string;
  moTa: string;
  thuTu: string;
};

const INITIAL_FORM: FormState = {
  tenThietBi: "",
  hang: "",
  hinhAnh: "",
  moTa: "",
  thuTu: "",
};

export default function AdminThietBiPage() {
  const toast = useToast();
  const [items, setItems] = useState<ThietBi[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function loadList() {
    try {
      const data = await thietBiApi.listAdmin();
      setItems(data);
    } catch (err) {
      toast.error(
        "Lỗi tải thiết bị",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
    }
  }

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await maLoiApi.uploadImage(file);
      setForm((f) => ({ ...f, hinhAnh: result.url }));
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

  function startEdit(t: ThietBi) {
    setEditingId(t.id);
    setForm({
      tenThietBi: t.tenThietBi,
      hang: t.hang ?? "",
      hinhAnh: t.hinhAnh ?? "",
      moTa: t.moTa ?? "",
      thuTu: String(t.thuTu),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(INITIAL_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const reqBody = {
        tenThietBi: form.tenThietBi,
        hang: form.hang || undefined,
        hinhAnh: form.hinhAnh || undefined,
        moTa: form.moTa || undefined,
        thuTu: form.thuTu === "" ? undefined : Number(form.thuTu),
      };
      if (editingId !== null) {
        await thietBiApi.updateAdmin(editingId, reqBody);
        toast.success("Đã cập nhật thiết bị", form.tenThietBi);
      } else {
        await thietBiApi.createAdmin(reqBody);
        toast.success("Đã thêm thiết bị", form.tenThietBi);
      }
      setForm(INITIAL_FORM);
      setEditingId(null);
      await loadList();
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
    if (!confirm("Xoá thiết bị này? Mã lỗi liên quan sẽ bị ẩn nếu thiết bị có mã lỗi."))
      return;
    try {
      await thietBiApi.deleteAdmin(id);
      if (editingId === id) cancelEdit();
      await loadList();
      toast.success("Đã xoá thiết bị");
    } catch (err) {
      toast.error(
        "Không thể xoá",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
    }
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const a = items[index]!;
    const b = items[target]!;
    setReordering(true);
    try {
      await thietBiApi.updateAdmin(a.id, {
        tenThietBi: a.tenThietBi,
        hang: a.hang,
        hinhAnh: a.hinhAnh,
        moTa: a.moTa,
        thuTu: b.thuTu,
      });
      await thietBiApi.updateAdmin(b.id, {
        tenThietBi: b.tenThietBi,
        hang: b.hang,
        hinhAnh: b.hinhAnh,
        moTa: b.moTa,
        thuTu: a.thuTu,
      });
      await loadList();
    } catch (err) {
      toast.error(
        "Lỗi sắp xếp",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
    } finally {
      setReordering(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">Thiết bị</h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        Tạo / sửa / xoá thiết bị — sắp xếp thứ tự hiển thị (mũi tên ▲▼ hoặc ô &quot;Thứ tự&quot;).
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[400px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="flex h-fit flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {editingId !== null ? `Sửa #${editingId}` : "Thêm thiết bị"}
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
            name="tenThietBi"
            label="Tên thiết bị"
            value={form.tenThietBi}
            onChange={(e) => setForm({ ...form, tenThietBi: e.target.value })}
            required
            minLength={2}
            maxLength={150}
          />

          <Input
            name="hang"
            label="Hãng (Samsung, LG, Sony...)"
            value={form.hang}
            onChange={(e) => setForm({ ...form, hang: e.target.value })}
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

          <div className="flex flex-col gap-1">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Mô tả
            </label>
            <textarea
              value={form.moTa}
              onChange={(e) => setForm({ ...form, moTa: e.target.value })}
              rows={3}
              className="rounded-md border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ink-soft)]/30"
            />
          </div>

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

          <Button type="submit" disabled={submitting || uploading}>
            {submitting
              ? editingId !== null
                ? "Đang lưu..."
                : "Đang tạo..."
              : editingId !== null
                ? "Lưu thay đổi"
                : "Tạo thiết bị"}
          </Button>
        </form>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Danh sách ({items.length})</h2>
            {reordering && (
              <span className="text-xs text-[color:var(--color-muted)]">
                Đang sắp xếp...
              </span>
            )}
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-[color:var(--color-muted)]">Chưa có thiết bị nào.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-border)] text-left text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  <th className="pb-2">Thứ tự</th>
                  <th className="pb-2">Ảnh</th>
                  <th className="pb-2">Tên thiết bị</th>
                  <th className="pb-2">Mã lỗi</th>
                  <th className="pb-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t, idx) => {
                  const img = imageUrl(t.hinhAnh);
                  return (
                    <tr
                      key={t.id}
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
                            disabled={idx === items.length - 1 || reordering}
                            aria-label="Xuống"
                            className="rounded p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-ivory-2)] disabled:opacity-30"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          <span className="ml-1 font-mono text-xs text-[color:var(--color-muted)]">
                            {t.thuTu}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={t.tenThietBi}
                            className="size-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="size-12 rounded-md bg-[color:var(--color-ivory-2)]" />
                        )}
                      </td>
                      <td className="py-3">
                        <p className="font-medium">{t.tenThietBi}</p>
                        <p className="text-xs text-[color:var(--color-muted)]">
                          {t.hang ? `${t.hang} · ` : ""}#{t.id}
                        </p>
                      </td>
                      <td className="py-3 text-[color:var(--color-muted)]">
                        {t.soMaLoi}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(t)}
                            aria-label="Sửa"
                            className="rounded-md p-1.5 text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-ivory-2)] hover:text-[color:var(--color-ink)]"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
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

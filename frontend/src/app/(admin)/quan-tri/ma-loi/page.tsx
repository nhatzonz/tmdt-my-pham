"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  imageUrl,
  maLoiApi,
  MUC_DO_BADGE,
  MUC_DO_LABEL,
  type MaLoi,
  type MucDo,
} from "@/features/ma-loi/api";
import { thietBiApi, type ThietBi } from "@/features/thiet-bi/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { useToast } from "@/lib/toast";

const MUC_DO_OPTIONS: { value: MucDo; label: string }[] = [
  { value: "NHE", label: MUC_DO_LABEL.NHE },
  { value: "TRUNG_BINH", label: MUC_DO_LABEL.TRUNG_BINH },
  { value: "NGHIEM_TRONG", label: MUC_DO_LABEL.NGHIEM_TRONG },
];

type FormState = {
  maLoi: string;
  tenLoi: string;
  thietBiId: string;
  moTa: string;
  nguyenNhan: string;
  cachKhacPhuc: string;
  mucDo: MucDo | "";
  hinhAnh: string[];
};

const INITIAL_FORM: FormState = {
  maLoi: "",
  tenLoi: "",
  thietBiId: "",
  moTa: "",
  nguyenNhan: "",
  cachKhacPhuc: "",
  mucDo: "",
  hinhAnh: [],
};

export default function AdminMaLoiPage() {
  const toast = useToast();
  const [thietBis, setThietBis] = useState<ThietBi[]>([]);
  const [items, setItems] = useState<MaLoi[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function loadAll() {
    try {
      const [tbs, list] = await Promise.all([
        thietBiApi.listAdmin(),
        maLoiApi.listAdmin(),
      ]);
      setThietBis(tbs);
      setItems(list);
    } catch (err) {
      toast.error(
        "Lỗi tải dữ liệu",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tbMap = useMemo(
    () => new Map(thietBis.map((t) => [t.id, t.tenThietBi])),
    [thietBis],
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const result = await maLoiApi.uploadImage(file);
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

  function startEdit(m: MaLoi) {
    setEditingId(m.id);
    setForm({
      maLoi: m.maLoi,
      tenLoi: m.tenLoi,
      thietBiId: String(m.thietBiId),
      moTa: m.moTa ?? "",
      nguyenNhan: m.nguyenNhan ?? "",
      cachKhacPhuc: m.cachKhacPhuc ?? "",
      mucDo: m.mucDo,
      hinhAnh: m.hinhAnh ?? [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(INITIAL_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.mucDo || !form.thietBiId) return;
    setSubmitting(true);
    try {
      const reqBody = {
        maLoi: form.maLoi,
        tenLoi: form.tenLoi,
        thietBiId: Number(form.thietBiId),
        moTa: form.moTa || undefined,
        nguyenNhan: form.nguyenNhan || undefined,
        cachKhacPhuc: form.cachKhacPhuc || undefined,
        mucDo: form.mucDo,
        hinhAnh: form.hinhAnh,
      };
      if (editingId !== null) {
        await maLoiApi.updateAdmin(editingId, reqBody);
        toast.success("Đã cập nhật mã lỗi", form.maLoi);
      } else {
        await maLoiApi.createAdmin(reqBody);
        toast.success("Đã thêm mã lỗi", form.maLoi);
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
    if (!confirm("Xoá mã lỗi này? Toàn bộ ảnh cũng sẽ bị xoá.")) return;
    try {
      await maLoiApi.deleteAdmin(id);
      if (editingId === id) cancelEdit();
      await loadAll();
      toast.success("Đã xoá mã lỗi");
    } catch (err) {
      toast.error(
        "Không thể xoá",
        err instanceof ApiError ? err.message : "Lỗi không xác định",
      );
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">Mã lỗi</h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        Tạo, sửa và xoá mã lỗi. Hỗ trợ nhiều ảnh minh hoạ.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="flex h-fit flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {editingId !== null ? `Sửa #${editingId}` : "Thêm mã lỗi"}
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
            name="maLoi"
            label="Mã lỗi"
            placeholder="vd: E01, F-22, H03"
            value={form.maLoi}
            onChange={(e) => setForm({ ...form, maLoi: e.target.value })}
            required
            maxLength={50}
          />

          <Input
            name="tenLoi"
            label="Tên lỗi"
            value={form.tenLoi}
            onChange={(e) => setForm({ ...form, tenLoi: e.target.value })}
            required
            minLength={2}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Thiết bị <span className="text-rose-600">*</span>
            </label>
            <select
              required
              value={form.thietBiId}
              onChange={(e) => setForm({ ...form, thietBiId: e.target.value })}
              className="rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-ink)]"
            >
              <option value="">— Chọn thiết bị —</option>
              {thietBis.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tenThietBi}
                  {t.hang ? ` (${t.hang})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Mức độ <span className="text-rose-600">*</span>
            </label>
            <select
              required
              value={form.mucDo}
              onChange={(e) => setForm({ ...form, mucDo: e.target.value as MucDo | "" })}
              className="rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-ink)]"
            >
              <option value="">— Chọn mức độ —</option>
              {MUC_DO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Nguyên nhân
            </label>
            <textarea
              value={form.nguyenNhan}
              onChange={(e) => setForm({ ...form, nguyenNhan: e.target.value })}
              rows={3}
              className="resize-none rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-ink)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Cách khắc phục
            </label>
            <textarea
              value={form.cachKhacPhuc}
              onChange={(e) => setForm({ ...form, cachKhacPhuc: e.target.value })}
              rows={4}
              className="resize-none rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-ink)]"
            />
          </div>

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
                : "Tạo mã lỗi"}
          </Button>
        </form>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Danh sách ({items.length})</h2>
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-[color:var(--color-muted)]">Chưa có mã lỗi nào.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-border)] text-left text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  <th className="pb-2">Ảnh</th>
                  <th className="pb-2">Mã</th>
                  <th className="pb-2">Tên lỗi</th>
                  <th className="pb-2">Thiết bị</th>
                  <th className="pb-2">Mức độ</th>
                  <th className="pb-2">Lượt xem</th>
                  <th className="pb-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => {
                  const firstImg = imageUrl(m.hinhAnh?.[0]);
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-[color:var(--color-border)] last:border-0"
                    >
                      <td className="py-3">
                        <div className="relative">
                          {firstImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={firstImg}
                              alt={m.tenLoi}
                              className="size-12 rounded-md object-cover"
                            />
                          ) : (
                            <div className="size-12 rounded-md bg-[color:var(--color-ivory-2)]" />
                          )}
                          {m.hinhAnh.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 rounded-full bg-[color:var(--color-ink)] px-1.5 py-0.5 text-[9px] text-white">
                              +{m.hinhAnh.length - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 font-mono text-xs">{m.maLoi}</td>
                      <td className="py-3">
                        <p className="font-medium">{m.tenLoi}</p>
                        <p className="text-xs text-[color:var(--color-muted)]">#{m.id}</p>
                      </td>
                      <td className="py-3">{tbMap.get(m.thietBiId) ?? "—"}</td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ring-1",
                            MUC_DO_BADGE[m.mucDo],
                          )}
                        >
                          {MUC_DO_LABEL[m.mucDo]}
                        </span>
                      </td>
                      <td className="py-3 text-[color:var(--color-muted)]">{m.luotXem}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(m)}
                            aria-label="Sửa"
                            className="rounded-md p-1.5 text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-ivory-2)] hover:text-[color:var(--color-ink)]"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
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

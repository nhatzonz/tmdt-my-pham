"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Mail, MapPin, Phone, Save, Share2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  systemConfigApi,
  type SystemConfig,
  type SystemConfigRequest,
} from "@/features/cau-hinh/api";
import { imageUrl, maLoiApi } from "@/features/ma-loi/api";
import { ApiError } from "@/lib/api-client";
import { useToast } from "@/lib/toast";

type Form = SystemConfigRequest;

const EMPTY: Form = {
  tenHeThong: "",
  logoUrl: "",
  moTa: "",
  soDienThoai: "",
  emailLienHe: "",
  diaChi: "",
  linkFacebook: "",
  linkYoutube: "",
};

export default function AdminCauHinhPage() {
  const toast = useToast();
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    systemConfigApi
      .get()
      .then((c) => setForm(merge(c)))
      .catch((e) =>
        toast.error(
          "Lỗi tải cấu hình",
          e instanceof ApiError ? e.message : "Lỗi không xác định",
        ),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function merge(c: SystemConfig): Form {
    return {
      tenHeThong: c.tenHeThong ?? "",
      logoUrl: c.logoUrl ?? "",
      moTa: c.moTa ?? "",
      soDienThoai: c.soDienThoai ?? "",
      emailLienHe: c.emailLienHe ?? "",
      diaChi: c.diaChi ?? "",
      linkFacebook: c.linkFacebook ?? "",
      linkYoutube: c.linkYoutube ?? "",
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await systemConfigApi.update(form);
      setForm(merge(updated));
      toast.success("Đã lưu cấu hình hệ thống");
    } catch (e) {
      toast.error(
        "Không lưu được",
        e instanceof ApiError ? e.message : "Lỗi không xác định",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadLogo(file: File) {
    setUploading(true);
    try {
      const res = await maLoiApi.uploadImage(file);
      setForm({ ...form, logoUrl: res.url });
      toast.success("Đã tải logo lên", "Nhớ bấm Lưu để áp dụng");
    } catch (e) {
      toast.error(
        "Không upload được logo",
        e instanceof ApiError ? e.message : "Lỗi không xác định",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-[color:var(--color-muted)]">
        Đang tải...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl">Cấu hình hệ thống</h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Tên, logo, mô tả và liên hệ — sẽ hiển thị trên Header và Footer.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
            <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] pb-3">
              <Building2 className="size-5 text-[color:var(--color-muted)]" />
              <h2 className="font-medium">Thương hiệu</h2>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <Input
                name="tenHeThong"
                label="Tên hệ thống"
                value={form.tenHeThong}
                onChange={(e) => setForm({ ...form, tenHeThong: e.target.value })}
                required
                maxLength={255}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  Mô tả ngắn
                </label>
                <textarea
                  value={form.moTa ?? ""}
                  onChange={(e) => setForm({ ...form, moTa: e.target.value })}
                  rows={3}
                  className="resize-none rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--color-ink)]"
                />
              </div>

              <div className="flex items-end gap-4">
                <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-[color:var(--color-ivory-2)] ring-1 ring-[color:var(--color-border)]">
                  {form.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imageUrl(form.logoUrl) ?? ""}
                      alt="Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-[color:var(--color-muted)]">
                      Chưa có logo
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadLogo(f);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="size-4" />
                    {uploading ? "Đang tải..." : "Tải logo lên"}
                  </Button>
                  <p className="text-[11px] text-[color:var(--color-muted)]">
                    JPEG/PNG/WEBP, tối đa 10MB.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
            <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] pb-3">
              <Phone className="size-5 text-[color:var(--color-muted)]" />
              <h2 className="font-medium">Liên hệ</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="soDienThoai"
                label="Số điện thoại"
                placeholder="0912345678"
                value={form.soDienThoai ?? ""}
                onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                maxLength={20}
              />
              <Input
                name="emailLienHe"
                type="email"
                label="Email liên hệ"
                placeholder="hello@tracuumaloi.vn"
                value={form.emailLienHe ?? ""}
                onChange={(e) => setForm({ ...form, emailLienHe: e.target.value })}
                maxLength={100}
                leftIcon={<Mail className="size-4" />}
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
            <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] pb-3">
              <MapPin className="size-5 text-[color:var(--color-muted)]" />
              <h2 className="font-medium">Địa chỉ</h2>
            </div>
            <div className="mt-4">
              <Input
                name="diaChi"
                label="Địa chỉ"
                placeholder="vd: 175 Tây Sơn, Đống Đa, Hà Nội"
                value={form.diaChi ?? ""}
                onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                maxLength={255}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
            <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] pb-3">
              <Share2 className="size-5 text-[color:var(--color-muted)]" />
              <h2 className="font-medium">Mạng xã hội</h2>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <Input
                name="linkFacebook"
                label="Facebook"
                placeholder="https://facebook.com/..."
                value={form.linkFacebook ?? ""}
                onChange={(e) => setForm({ ...form, linkFacebook: e.target.value })}
                maxLength={1000}
              />
              <Input
                name="linkYoutube"
                label="YouTube"
                placeholder="https://youtube.com/@..."
                value={form.linkYoutube ?? ""}
                onChange={(e) => setForm({ ...form, linkYoutube: e.target.value })}
                maxLength={1000}
              />
            </div>
          </section>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="size-4" />
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Save,
  Share2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  type StoreConfig,
  type StoreConfigRequest,
  storeConfigApi,
} from "@/features/cau-hinh/api";
import { imageUrl, productApi } from "@/features/san-pham/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";

type Form = StoreConfigRequest;

const EMPTY: Form = {
  tenCuaHang: "",
  logoUrl: "",
  diaChiTinh: "",
  diaChiQuan: "",
  diaChiPhuong: "",
  diaChiChiTiet: "",
  soDienThoai: "",
  emailLienHe: "",
  linkFacebook: "",
  linkInstagram: "",
  linkTiktok: "",
  linkYoutube: "",
};

export default function AdminCauHinhPage() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    storeConfigApi
      .get()
      .then((c) => setForm(merge(c)))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Lỗi tải cấu hình"))
      .finally(() => setLoading(false));
  }, []);

  function merge(c: StoreConfig): Form {
    return {
      tenCuaHang: c.tenCuaHang ?? "",
      logoUrl: c.logoUrl ?? "",
      diaChiTinh: c.diaChiTinh ?? "",
      diaChiQuan: c.diaChiQuan ?? "",
      diaChiPhuong: c.diaChiPhuong ?? "",
      diaChiChiTiet: c.diaChiChiTiet ?? "",
      soDienThoai: c.soDienThoai ?? "",
      emailLienHe: c.emailLienHe ?? "",
      linkFacebook: c.linkFacebook ?? "",
      linkInstagram: c.linkInstagram ?? "",
      linkTiktok: c.linkTiktok ?? "",
      linkYoutube: c.linkYoutube ?? "",
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setActionMsg(null);
    try {
      const updated = await storeConfigApi.update(form);
      setForm(merge(updated));
      setActionMsg("Đã lưu cấu hình cửa hàng");
      setTimeout(() => setActionMsg(null), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Lỗi lưu");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadLogo(file: File) {
    setUploading(true);
    setError(null);
    try {
      const res = await productApi.uploadImage(file);
      setForm({ ...form, logoUrl: res.url });
      setActionMsg("Đã tải logo lên — nhớ bấm Lưu để áp dụng");
      setTimeout(() => setActionMsg(null), 2500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không upload được logo");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl">Cấu hình cửa hàng</h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Tên, logo, địa chỉ, liên hệ và link mạng xã hội — sẽ hiển thị trên Footer + trang Liên hệ.
        </p>
      </div>

      {(error || actionMsg) && (
        <div
          className={cn(
            "rounded-md px-3 py-2 text-xs",
            error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700",
          )}
        >
          {error ?? actionMsg}
        </div>
      )}

      {/* Tên + logo */}
      <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
        <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] pb-3">
          <Building2 className="size-5 text-[color:var(--color-muted)]" />
          <h2 className="font-medium">Thương hiệu</h2>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <Input
            name="tenCuaHang"
            label="Tên cửa hàng"
            value={form.tenCuaHang}
            onChange={(e) => setForm({ ...form, tenCuaHang: e.target.value })}
            required
            maxLength={255}
          />

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

      {/* Địa chỉ */}
      <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
        <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] pb-3">
          <MapPin className="size-5 text-[color:var(--color-muted)]" />
          <h2 className="font-medium">Địa chỉ</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            name="diaChiTinh"
            label="Tỉnh / Thành"
            value={form.diaChiTinh ?? ""}
            onChange={(e) => setForm({ ...form, diaChiTinh: e.target.value })}
            maxLength={100}
          />
          <Input
            name="diaChiQuan"
            label="Quận / Huyện"
            value={form.diaChiQuan ?? ""}
            onChange={(e) => setForm({ ...form, diaChiQuan: e.target.value })}
            maxLength={100}
          />
          <Input
            name="diaChiPhuong"
            label="Phường / Xã"
            value={form.diaChiPhuong ?? ""}
            onChange={(e) => setForm({ ...form, diaChiPhuong: e.target.value })}
            maxLength={100}
          />
        </div>
        <div className="mt-4">
          <Input
            name="diaChiChiTiet"
            label="Số nhà / đường"
            placeholder="vd: 175 Tây Sơn"
            value={form.diaChiChiTiet ?? ""}
            onChange={(e) => setForm({ ...form, diaChiChiTiet: e.target.value })}
            maxLength={255}
          />
        </div>
      </section>

      {/* Liên hệ */}
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
            placeholder="hello@cuahang.vn"
            value={form.emailLienHe ?? ""}
            onChange={(e) => setForm({ ...form, emailLienHe: e.target.value })}
            maxLength={100}
            leftIcon={<Mail className="size-4" />}
          />
        </div>
      </section>

      {/* Mạng xã hội */}
      <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
        <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] pb-3">
          <Share2 className="size-5 text-[color:var(--color-muted)]" />
          <h2 className="font-medium">Mạng xã hội</h2>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <Input
            name="linkFacebook"
            label="Facebook"
            placeholder="https://facebook.com/cuahang"
            value={form.linkFacebook ?? ""}
            onChange={(e) => setForm({ ...form, linkFacebook: e.target.value })}
            maxLength={1000}
          />
          <Input
            name="linkInstagram"
            label="Instagram"
            placeholder="https://instagram.com/cuahang"
            value={form.linkInstagram ?? ""}
            onChange={(e) => setForm({ ...form, linkInstagram: e.target.value })}
            maxLength={1000}
          />
          <Input
            name="linkTiktok"
            label="TikTok"
            placeholder="https://tiktok.com/@cuahang"
            value={form.linkTiktok ?? ""}
            onChange={(e) => setForm({ ...form, linkTiktok: e.target.value })}
            maxLength={1000}
          />
          <Input
            name="linkYoutube"
            label="YouTube"
            placeholder="https://youtube.com/@cuahang"
            value={form.linkYoutube ?? ""}
            onChange={(e) => setForm({ ...form, linkYoutube: e.target.value })}
            maxLength={1000}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="size-4" />
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </div>
    </form>
  );
}

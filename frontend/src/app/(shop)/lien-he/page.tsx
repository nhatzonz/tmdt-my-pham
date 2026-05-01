import { Mail, MapPin, Phone } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { storeConfigApi, type StoreConfig } from "@/features/cau-hinh/api";

export const dynamic = "force-dynamic";

export default async function LienHePage() {
  let config: StoreConfig | null = null;
  try {
    config = await storeConfigApi.get();
  } catch {
    /* fallback */
  }

  const tenCuaHang = config?.tenCuaHang || "Ngọc Lan Beauty";
  const diaChi = config?.diaChiDayDu;
  const sdt = config?.soDienThoai;
  const email = config?.emailLienHe;
  const socials = [
    { label: "Facebook", href: config?.linkFacebook, badge: "FB" },
    { label: "Instagram", href: config?.linkInstagram, badge: "IG" },
    { label: "TikTok", href: config?.linkTiktok, badge: "TT" },
    { label: "YouTube", href: config?.linkYoutube, badge: "YT" },
  ].filter((s) => s.href);

  // Google Maps embed (free, no API key) — mặc dù chỉ là search query, đủ cho demo
  const mapsQuery = diaChi ? encodeURIComponent(diaChi) : null;

  return (
    <div className="mx-auto w-4/5 max-w-5xl px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Liên hệ" },
        ]}
      />

      <div className="mt-6">
        <h1 className="font-serif text-4xl md:text-5xl">Liên hệ {tenCuaHang}</h1>
        <p className="mt-3 text-sm text-[color:var(--color-muted)]">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn — hãy ghé thăm hoặc liên lạc qua thông tin
          bên dưới.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        {/* Map */}
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[color:var(--color-border)]">
          {mapsQuery ? (
            <iframe
              title="Bản đồ cửa hàng"
              src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
              className="h-[420px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center text-sm text-[color:var(--color-muted)]">
              Chưa cấu hình địa chỉ cửa hàng
            </div>
          )}
        </div>

        {/* Info */}
        <aside className="flex h-fit flex-col gap-5 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <h2 className="font-medium">Thông tin liên hệ</h2>

          {diaChi && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-[color:var(--color-muted)]" />
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  Địa chỉ
                </p>
                <p className="mt-1 text-sm">{diaChi}</p>
              </div>
            </div>
          )}

          {sdt && (
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-[color:var(--color-muted)]" />
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  Hotline
                </p>
                <a href={`tel:${sdt}`} className="mt-1 block text-sm hover:underline">
                  {sdt}
                </a>
              </div>
            </div>
          )}

          {email && (
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-[color:var(--color-muted)]" />
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  Email
                </p>
                <a href={`mailto:${email}`} className="mt-1 block text-sm hover:underline">
                  {email}
                </a>
              </div>
            </div>
          )}

          {socials.length > 0 && (
            <div className="border-t border-[color:var(--color-border)] pt-4">
              <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
                Theo dõi chúng tôi
              </p>
              <div className="mt-3 flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="flex size-9 items-center justify-center rounded-full bg-[color:var(--color-ivory-2)] text-xs font-semibold text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-ink)] hover:text-white"
                  >
                    {s.badge}
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

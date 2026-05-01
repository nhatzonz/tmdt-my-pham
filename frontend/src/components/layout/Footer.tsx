import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { storeConfigApi, type StoreConfig } from "@/features/cau-hinh/api";
import { imageUrl } from "@/features/san-pham/api";

const SHOP_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Tất cả sản phẩm", href: "/san-pham" },
  { label: "Liên hệ", href: "/lien-he" },
];

export async function Footer() {
  let config: StoreConfig | null = null;
  try {
    config = await storeConfigApi.get();
  } catch {
    /* fallback to hard-coded defaults below */
  }

  const tenCuaHang = config?.tenCuaHang || "Ngọc Lan Beauty";
  const logoSrc = (config?.logoUrl && imageUrl(config.logoUrl)) || "/logo.png";
  const diaChi = config?.diaChiDayDu;
  const sdt = config?.soDienThoai;
  const email = config?.emailLienHe;

  return (
    <footer className="mt-20 bg-[color:var(--color-footer-bg)] text-white/80">
      <div className="mx-auto grid w-4/5 grid-cols-1 gap-12 px-6 py-14 md:grid-cols-3">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <Image
              src={logoSrc}
              alt={tenCuaHang}
              width={36}
              height={36}
              unoptimized
              className="size-9 object-contain"
            />
            <span className="font-serif text-2xl italic leading-none text-white">
              {tenCuaHang}
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm">
            Mỹ phẩm Á Đông — thành phần minh bạch, công thức dịu nhẹ, dành riêng cho
            làn da và khí hậu nhiệt đới.
          </p>
          {/* Social */}
          {(config?.linkFacebook
            || config?.linkInstagram
            || config?.linkTiktok
            || config?.linkYoutube) && (
            <div className="mt-5 flex gap-3">
              {config?.linkFacebook && (
                <SocialIcon href={config.linkFacebook} label="Facebook" badge="FB" />
              )}
              {config?.linkInstagram && (
                <SocialIcon href={config.linkInstagram} label="Instagram" badge="IG" />
              )}
              {config?.linkTiktok && (
                <SocialIcon href={config.linkTiktok} label="TikTok" badge="TT" />
              )}
              {config?.linkYoutube && (
                <SocialIcon href={config.linkYoutube} label="YouTube" badge="YT" />
              )}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <p className="mb-4 text-[11px] uppercase tracking-widest text-white/50">
            Khám phá
          </p>
          <ul className="space-y-2 text-sm">
            {SHOP_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="mb-4 text-[11px] uppercase tracking-widest text-white/50">
            Liên hệ
          </p>
          <ul className="space-y-3 text-sm">
            {diaChi && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/60" />
                <span>{diaChi}</span>
              </li>
            )}
            {sdt && (
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-white/60" />
                <a href={`tel:${sdt}`} className="hover:text-white">
                  {sdt}
                </a>
              </li>
            )}
            {email && (
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-white/60" />
                <a href={`mailto:${email}`} className="hover:text-white">
                  {email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-4/5 flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-white/50 md:flex-row">
          <p className="italic">Vẻ đẹp tự nhiên — chăm da mỗi ngày.</p>
          <p>{tenCuaHang} luôn âm thầm chăm sóc da của bạn</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  badge,
}: {
  href: string;
  label: string;
  badge: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white transition hover:bg-white/20"
    >
      {badge}
    </a>
  );
}

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
                <SocialIcon href={config.linkFacebook} label="Facebook">
                  <FacebookIcon />
                </SocialIcon>
              )}
              {config?.linkInstagram && (
                <SocialIcon href={config.linkInstagram} label="Instagram">
                  <InstagramIcon />
                </SocialIcon>
              )}
              {config?.linkTiktok && (
                <SocialIcon href={config.linkTiktok} label="TikTok">
                  <TiktokIcon />
                </SocialIcon>
              )}
              {config?.linkYoutube && (
                <SocialIcon href={config.linkYoutube} label="YouTube">
                  <YoutubeIcon />
                </SocialIcon>
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
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
    >
      {children}
    </a>
  );
}

/* Brand SVG icons — lucide v1 không export Facebook/Instagram/Youtube. */

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.75 8.43-4.91 8.43-9.93z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.86a8.16 8.16 0 0 0 4.77 1.52V6.93a4.85 4.85 0 0 1-1.84-.24z"/>
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M23.5 6.5a3 3 0 0 0-2.1-2.12C19.6 4 12 4 12 4s-7.6 0-9.4.38A3 3 0 0 0 .5 6.5C.12 8.3.12 12 .12 12s0 3.7.38 5.5a3 3 0 0 0 2.1 2.12C4.4 20 12 20 12 20s7.6 0 9.4-.38a3 3 0 0 0 2.1-2.12c.38-1.8.38-5.5.38-5.5s0-3.7-.38-5.5zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
    </svg>
  );
}

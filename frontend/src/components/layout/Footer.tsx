import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const SHOP_LINKS = [
  { label: "Tất cả sản phẩm", href: "/san-pham" },
  { label: "Trang chủ", href: "/" },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-[color:var(--color-footer-bg)] text-white/80">
      <div className="mx-auto grid w-4/5 grid-cols-1 gap-12 px-6 py-14 md:grid-cols-3">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Ngọc Lan Beauty"
              width={36}
              height={36}
              className="size-9 object-contain"
            />
            <span className="font-serif text-2xl italic leading-none text-white">
              Ngọc Lan Beauty
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm">
            Mỹ phẩm Á Đông — thành phần minh bạch, công thức dịu nhẹ, dành riêng cho
            làn da và khí hậu nhiệt đới.
          </p>
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
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-white/60" />
              <span>175 Tây Sơn, Đống Đa, Hà Nội</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-white/60" />
              <a href="tel:+84901234567" className="hover:text-white">
                0901 234 567
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-white/60" />
              <a href="mailto:hello@ngoclanbeauty.vn" className="hover:text-white">
                hello@ngoclanbeauty.vn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-4/5 flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-white/50 md:flex-row">
          <p className="italic">Vẻ đẹp tự nhiên — chăm da mỗi ngày.</p>
          <p>Ngọc Lan Beauty luôn âm thầm chăm sóc da của bạn</p>
        </div>
      </div>
    </footer>
  );
}

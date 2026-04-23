import Link from "next/link";

const SHOP_LINKS = [
  { label: "Tất cả sản phẩm", href: "/san-pham" },
  { label: "Chăm sóc da", href: "/san-pham?danh_muc=skincare" },
  { label: "Trang điểm", href: "/san-pham?danh_muc=makeup" },
  { label: "Body & tóc", href: "/san-pham?danh_muc=body-hair" },
];

export function Footer() {
  return (
    <footer className="bg-[color:var(--color-footer-bg)] text-white/80">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-full border border-white/60 text-[10px]">
              i
            </span>
            <span className="font-serif text-2xl italic leading-none text-white">
              Lumière
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm">
            Mỹ phẩm & nhân hoá theo làn da Á Đông. Thành phần minh bạch — công thức dịu
            nhẹ — tư vấn bằng AI.
          </p>
        </div>

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
      </div>
    </footer>
  );
}

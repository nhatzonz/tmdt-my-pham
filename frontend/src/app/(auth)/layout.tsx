import Image from "next/image";
import Link from "next/link";
import { systemConfigApi } from "@/features/cau-hinh/api";
import { imageUrl } from "@/features/ma-loi/api";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  let tenHeThong = "Tra Cứu Mã Lỗi";
  let logoSrc = "/logo.png";
  try {
    const cfg = await systemConfigApi.get();
    if (cfg?.tenHeThong) tenHeThong = cfg.tenHeThong;
    const u = cfg?.logoUrl ? imageUrl(cfg.logoUrl) : null;
    if (u) logoSrc = u;
  } catch {}
  return (
    <div className="flex min-h-screen bg-[color:var(--color-ivory)]">
      <section
        className="relative hidden w-1/2 overflow-hidden bg-cover bg-center p-12 lg:flex lg:flex-col"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1200&h=1600&fit=crop&q=80')",
        }}
      >
        <Link href="/" className="relative flex items-center gap-2 text-[color:var(--color-ink)]">
          <Image
            src={logoSrc}
            alt={tenHeThong}
            width={48}
            height={48}
            unoptimized
            className="size-12 object-contain"
            priority
          />
          <span className="font-serif text-2xl italic leading-none">{tenHeThong}</span>
        </Link>
      </section>

      <section className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between px-4 py-5 sm:px-8 sm:py-6 lg:justify-end">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Image
              src={logoSrc}
              alt={tenHeThong}
              width={36}
              height={36}
              unoptimized
              className="size-9 object-contain"
              priority
            />
            <span className="font-serif text-xl italic leading-none">{tenHeThong}</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </div>
  );
}

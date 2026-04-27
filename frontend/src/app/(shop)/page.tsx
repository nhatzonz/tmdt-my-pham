import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <section className="relative">
      <div className="mx-auto grid w-4/5 grid-cols-1 items-center gap-12 px-6 pt-5 lg:grid-cols-2">
        {/* LEFT — Text */}
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center rounded-full bg-[color:var(--color-pastel-cream)] px-3 py-1 text-[11px] uppercase tracking-widest text-[color:var(--color-ink-soft)]">
            ✦ Ngọc Lan Beauty · Mùa xuân 2026
          </span>

          <h1 className="font-serif text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
            Routine làm đẹp
            <br />
            <span className="italic">dành riêng</span> cho làn da
            <br />
            <span className="italic">của bạn</span>.
          </h1>

          <p className="max-w-md text-[color:var(--color-muted)]">
            Mỹ phẩm Á Đông — thành phần minh bạch, công thức dịu nhẹ, dành riêng
            cho làn da và khí hậu nhiệt đới.
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/san-pham">
              <Button size="lg">
                Khám phá sản phẩm <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT — Image */}
        <div className="relative">
          <div
            className="aspect-[4/3] w-full rounded-2xl bg-cover bg-center shadow-lg"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1571875257727-256c39da42af?w=1200&h=900&fit=crop&q=80')",
            }}
          />
          <div className="pointer-events-none absolute -left-6 -top-6 -z-10 size-32 rounded-full bg-[color:var(--color-pastel-blush)] opacity-60 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 -z-10 size-40 rounded-full bg-[color:var(--color-pastel-mint)] opacity-60 blur-2xl" />
        </div>
      </div>
    </section>
  );
}

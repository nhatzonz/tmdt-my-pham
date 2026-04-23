import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { categoryApi } from "@/features/danh-muc/api";
import { CategoryCard } from "@/features/danh-muc/components/CategoryCard";
import { pastelBg, productApi } from "@/features/san-pham/api";
import { ProductCard } from "@/features/san-pham/components/ProductCard";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [products, categories] = await Promise.all([
      productApi.list(),
      categoryApi.list(),
    ]);
    return { products, categories, error: null as string | null };
  } catch (err) {
    return {
      products: [],
      categories: [],
      error: err instanceof Error ? err.message : "Không tải được dữ liệu",
    };
  }
}

export default async function HomePage() {
  const { products, categories, error } = await getData();
  const bestSellers = products.slice(0, 4);
  const aiPicks = products.slice(4, 8);

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* HERO */}
      <section className="relative grid grid-cols-1 gap-12 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col justify-center">
          <Badge tone="new" className="self-start">
            <span className="mr-1">✦</span> Ra mắt · Mùa xuân 2026
          </Badge>
          <h1 className="mt-6 font-serif text-5xl leading-[1.1] md:text-6xl">
            Routine làm đẹp
            <br />
            <span className="italic">dành riêng</span> cho làn da
            <br />
            <span className="italic">của bạn</span>.
          </h1>
          <p className="mt-6 max-w-md text-[color:var(--color-muted)]">
            Quiz 90 giây — AI phân tích loại da, nhu cầu & khí hậu để gợi ý bộ sản
            phẩm phù hợp nhất. Kèm mẫu thử trong mọi đơn hàng.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg">
              Bắt đầu Quiz AI <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline">
              Mua tất cả sản phẩm
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-14 gap-y-6">
            <Stat value={String(products.length)} label="Sản phẩm đang bán" />
            <Stat value={String(categories.length)} label="Danh mục" />
            <Stat value="94%" label="Khách hài lòng" />
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute left-4 top-12 size-36 rounded-full bg-[color:var(--color-pastel-mint)]" />
          <div className="absolute right-8 top-4 size-20 rounded-full bg-[color:var(--color-pastel-blush)]/80" />
          <div className="absolute bottom-6 left-20 size-16 rounded-full bg-[color:var(--color-pastel-cream)]" />
          <div className="relative flex size-80 items-center justify-center rounded-full bg-[color:var(--color-pastel-beige)]">
            <div className="flex h-56 w-28 flex-col items-center justify-between rounded-2xl bg-white/90 px-3 py-6 shadow-lg">
              <span className="font-serif text-xs italic">Lumière</span>
              <span className="text-[8px] uppercase tracking-wider text-[color:var(--color-muted)]">
                Serum
              </span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error} — kiểm tra backend có đang chạy không?
        </p>
      )}

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="font-serif text-3xl md:text-4xl">Khám phá theo danh mục</h2>
            <Link
              href="/san-pham"
              className="text-sm underline underline-offset-4 hover:text-[color:var(--color-ink)]"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            {categories.slice(0, 6).map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </section>
      )}

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <section className="py-16">
          <p className="mb-2 text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
            ✦ Sản phẩm mới
          </p>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-3xl md:text-4xl">
              Những gì mọi người yêu thích
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* AI RITUAL BANNER */}
      <section className="my-16 overflow-hidden rounded-2xl bg-[#3a2f26] text-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-10 md:p-16">
            <span className="text-[11px] uppercase tracking-widest text-white/60">
              ✦ AI Ritual
            </span>
            <h2 className="font-serif text-4xl leading-[1.1] md:text-5xl">
              Một quiz 90 giây.
              <br />
              Một routine cả đời.
            </h2>
            <p className="max-w-md text-sm text-white/70">
              AI phân tích loại da và gợi ý routine dành riêng cho bạn. Mô-đun AI sẽ
              hoàn thiện ở Phase 3 (Tuần 12-13).
            </p>
            <Button size="lg" variant="cream" className="w-fit">
              Thử quiz miễn phí <ArrowRight className="size-4" />
            </Button>
          </div>

          {aiPicks.length > 0 && (
            <div className="grid grid-cols-2 gap-3 p-6 md:p-10">
              {aiPicks.map((p, idx) => (
                <div
                  key={p.id}
                  className={cn(
                    "relative flex aspect-square flex-col justify-end rounded-xl p-4",
                    pastelBg(p.id),
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-3/5 w-1/3 rounded-md bg-white/80 shadow-sm" />
                  </div>
                  <div className="relative">
                    <p className="text-[9px] uppercase tracking-wider text-[color:var(--color-ink-soft)]/60">
                      {String(idx + 1).padStart(2, "0")} ·{" "}
                      {(p.thuongHieu ?? "LUMIÈRE").toUpperCase()}
                    </p>
                    <p className="line-clamp-1 text-xs font-medium text-[color:var(--color-ink-soft)]">
                      {p.tenSanPham}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-3xl">{value}</div>
      <div className="mt-1 text-xs text-[color:var(--color-muted)]">{label}</div>
    </div>
  );
}

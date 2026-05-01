import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RecommendedForYou } from "@/features/ai/components/RecommendedForYou";
import { categoryApi } from "@/features/danh-muc/api";
import { CategoryCard } from "@/features/danh-muc/components/CategoryCard";
import { productApi } from "@/features/san-pham/api";
import { ProductCard } from "@/features/san-pham/components/ProductCard";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [categories, products] = await Promise.all([
      categoryApi.list(),
      productApi.list(),
    ]);
    return { categories, products };
  } catch {
    return { categories: [], products: [] };
  }
}

export default async function HomePage() {
  const { categories, products } = await getData();
  const featured = products.slice(0, 8);

  return (
    <>
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto grid w-4/5 grid-cols-1 items-center gap-12 px-6 pt-5 lg:grid-cols-2">
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

      {/* AI PERSONALIZED — chỉ render khi user logged-in (component tự check) */}
      <RecommendedForYou />

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="mx-auto w-4/5 px-6 py-16">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-3xl md:text-4xl">Khám phá theo danh mục</h2>
            <Link
              href="/san-pham"
              className="text-sm underline underline-offset-4 hover:text-[color:var(--color-ink)]"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                category={c}
                productCount={c.productCount}
              />
            ))}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="mx-auto w-4/5 px-6 pb-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
                ✦ Sản phẩm
              </p>
              <h2 className="font-serif text-3xl md:text-4xl">Sản phẩm nổi bật</h2>
            </div>
            <Link
              href="/san-pham"
              className="text-sm underline underline-offset-4 hover:text-[color:var(--color-ink)]"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/san-pham">
              <Button size="lg" variant="outline">
                Xem tất cả sản phẩm <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

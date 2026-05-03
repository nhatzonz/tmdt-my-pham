import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { maLoiApi } from "@/features/ma-loi/api";
import { MaLoiCard } from "@/features/ma-loi/components/MaLoiCard";
import { thietBiApi } from "@/features/thiet-bi/api";
import { ThietBiCard } from "@/features/thiet-bi/components/ThietBiCard";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [thietBis, maLois] = await Promise.all([
      thietBiApi.list(),
      maLoiApi.list({ sort: "luot_xem_desc" }),
    ]);
    return { thietBis, maLois };
  } catch {
    return { thietBis: [], maLois: [] };
  }
}

export default async function HomePage() {
  const { thietBis, maLois } = await getData();
  const featured = maLois.slice(0, 8);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto flex w-full flex-col items-center gap-6 px-4 pt-10 pb-8 text-center md:w-4/5 md:gap-8 md:pt-20 md:pb-12 md:px-6">
          <span className="inline-flex w-fit items-center rounded-full bg-[color:var(--color-pastel-cream)] px-3 py-1 text-[11px] uppercase tracking-widest text-[color:var(--color-ink-soft)]">
            ✦ Hệ thống tra cứu mã lỗi thiết bị điện tử
          </span>

          <h1 className="font-serif text-3xl leading-[1.1] sm:text-5xl md:text-6xl">
            Nhập mã lỗi <span className="italic">— biết ngay</span>
            <br />
            nguyên nhân và cách khắc phục.
          </h1>

          <p className="max-w-xl text-[color:var(--color-muted)]">
            Tra cứu mã lỗi của tủ lạnh, máy giặt, điều hoà, tivi và nhiều thiết bị
            khác — kèm hình ảnh minh hoạ và giải pháp cụ thể.
          </p>

          <form
            action="/tra-cuu"
            method="get"
            className="mt-2 flex w-full max-w-2xl items-center gap-2 rounded-full bg-white px-2 py-2 shadow-md ring-1 ring-[color:var(--color-border)]"
          >
            <Search className="ml-3 size-5 text-[color:var(--color-muted)]" />
            <input
              type="text"
              name="q"
              placeholder="Nhập mã lỗi (vd: E01) hoặc tên lỗi..."
              className="flex-1 bg-transparent px-2 py-2 text-sm placeholder:text-[color:var(--color-muted)] focus:outline-none"
              autoComplete="off"
            />
            <Button type="submit" size="md">
              Tra cứu
            </Button>
          </form>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-[color:var(--color-muted)]">
            <span>Phổ biến:</span>
            {featured.slice(0, 4).map((m) => (
              <Link
                key={m.id}
                href={`/tra-cuu/${m.id}`}
                className="rounded-full bg-white/70 px-3 py-1 ring-1 ring-[color:var(--color-border)] hover:bg-white"
              >
                {m.maLoi}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {thietBis.length > 0 && (
        <section className="mx-auto w-full px-4 py-12 md:w-4/5 md:px-6 md:py-16">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-serif text-3xl md:text-4xl">Tra cứu theo thiết bị</h2>
            <Link
              href="/thiet-bi"
              className="text-sm underline underline-offset-4 hover:text-[color:var(--color-ink)]"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {thietBis.slice(0, 12).map((t) => (
              <ThietBiCard key={t.id} thietBi={t} />
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto w-full px-4 pb-16 md:w-4/5 md:px-6 md:pb-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
                ✦ Mã lỗi
              </p>
              <h2 className="font-serif text-3xl md:text-4xl">Mã lỗi được tra nhiều</h2>
            </div>
            <Link
              href="/tra-cuu"
              className="text-sm underline underline-offset-4 hover:text-[color:var(--color-ink)]"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((m) => (
              <MaLoiCard key={m.id} maLoi={m} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/tra-cuu">
              <Button size="lg" variant="outline">
                Xem tất cả mã lỗi <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

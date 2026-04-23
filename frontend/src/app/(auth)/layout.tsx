import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[color:var(--color-ivory)]">
      {/* Left — brand panel */}
      <section className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[color:var(--color-pastel-blush)] via-[color:var(--color-pastel-beige)] to-[color:var(--color-pastel-cream)] p-12 lg:flex lg:flex-col">
        {/* Decorative shapes */}
        <div className="absolute right-10 top-16 size-28 rounded-full bg-white/40" />
        <div className="absolute left-24 top-48 h-40 w-20 rounded-full bg-white/20" />
        <div className="absolute bottom-40 right-20 size-24 rounded-full bg-[color:var(--color-pastel-lavender)]/60" />

        <Link
          href="/"
          className="relative flex items-center gap-2 text-[color:var(--color-ink)]"
        >
          <span className="inline-flex size-6 items-center justify-center rounded-full border border-[color:var(--color-ink)] text-[10px] font-semibold">
            i
          </span>
          <span className="font-serif text-2xl italic leading-none">Lumière</span>
        </Link>

        <div className="relative mt-auto max-w-md">
          <span className="inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-[11px] uppercase tracking-widest text-[color:var(--color-ink-soft)]">
            ✦ Thành viên Lumière
          </span>
          <h2 className="mt-6 font-serif text-5xl leading-[1.1]">
            Routine của bạn —<br />
            <span className="italic">luôn ở đây</span>.
          </h2>
          <p className="mt-5 text-sm text-[color:var(--color-ink-soft)]">
            Lưu sản phẩm yêu thích, theo dõi đơn hàng, và nhận gợi ý AI được điều chỉnh
            theo mỗi mùa.
          </p>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-xs text-[color:var(--color-ink-soft)]">
            <span>—15% đơn đầu</span>
            <span>2× điểm sinh nhật</span>
            <span>Mẫu thử miễn phí</span>
          </div>
        </div>
      </section>

      {/* Right — form */}
      <section className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between px-8 py-6 lg:justify-end">
          <Link
            href="/"
            className="flex items-center gap-2 text-[color:var(--color-ink)] lg:hidden"
          >
            <span className="inline-flex size-6 items-center justify-center rounded-full border border-[color:var(--color-ink)] text-[10px] font-semibold">
              i
            </span>
            <span className="font-serif text-xl italic leading-none">Lumière</span>
          </Link>
          <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
            Khách hàng · Lumière
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center px-8 pb-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </div>
  );
}

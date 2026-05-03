import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronLeft, Wrench } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  imageUrl,
  maLoiApi,
  MUC_DO_BADGE,
  MUC_DO_LABEL,
} from "@/features/ma-loi/api";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MaLoiDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();

  let maLoi;
  try {
    maLoi = await maLoiApi.getById(numId);
  } catch {
    notFound();
  }

  const images = maLoi.hinhAnh.map((u) => imageUrl(u)).filter(Boolean) as string[];

  return (
    <div className="mx-auto w-full px-4 py-6 md:w-4/5 md:px-6 md:py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tra cứu mã lỗi", href: "/tra-cuu" },
          {
            label: maLoi.tenThietBi ?? "—",
            href: `/tra-cuu?thietBiId=${maLoi.thietBiId}`,
          },
          { label: maLoi.maLoi },
        ]}
      />

      <Link
        href="/tra-cuu"
        className="mt-4 inline-flex items-center gap-1 text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
      >
        <ChevronLeft className="size-4" />
        Quay lại danh sách
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          {images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0]}
                alt={maLoi.tenLoi}
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm"
              />
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1).map((src, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={i}
                      src={src}
                      alt={`${maLoi.tenLoi} ${i + 2}`}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-[color:var(--color-pastel-cream)] font-mono text-7xl text-[color:var(--color-ink-soft)]/50">
              {maLoi.maLoi}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-[color:var(--color-ink)] px-3 py-1 font-mono text-base text-white">
              {maLoi.maLoi}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ring-1",
                MUC_DO_BADGE[maLoi.mucDo],
              )}
            >
              {MUC_DO_LABEL[maLoi.mucDo]}
            </span>
            <span className="text-xs text-[color:var(--color-muted)]">
              {maLoi.luotXem.toLocaleString("vi-VN")} lượt xem
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl">{maLoi.tenLoi}</h1>

          {maLoi.tenThietBi && (
            <p className="text-sm text-[color:var(--color-ink-soft)]">
              Thiết bị:{" "}
              <Link
                href={`/tra-cuu?thietBiId=${maLoi.thietBiId}`}
                className="font-medium text-[color:var(--color-ink)] underline underline-offset-4"
              >
                {maLoi.tenThietBi}
              </Link>
              {maLoi.hangThietBi ? ` · ${maLoi.hangThietBi}` : ""}
            </p>
          )}

          {maLoi.moTa && (
            <Section title="Mô tả lỗi">
              <p className="whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                {maLoi.moTa}
              </p>
            </Section>
          )}

          {maLoi.nguyenNhan && (
            <Section
              title="Nguyên nhân"
              icon={<AlertTriangle className="size-4 text-amber-600" />}
            >
              <p className="whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                {maLoi.nguyenNhan}
              </p>
            </Section>
          )}

          {maLoi.cachKhacPhuc && (
            <Section
              title="Cách khắc phục"
              icon={<Wrench className="size-4 text-emerald-600" />}
            >
              <p className="whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
                {maLoi.cachKhacPhuc}
              </p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h2 className="font-medium text-[color:var(--color-ink)]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

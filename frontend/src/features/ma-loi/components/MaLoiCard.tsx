import Link from "next/link";
import { Eye } from "lucide-react";
import {
  imageUrl,
  MUC_DO_BADGE,
  MUC_DO_LABEL,
  pastelBg,
  type MaLoi,
} from "@/features/ma-loi/api";
import { cn } from "@/lib/cn";

export function MaLoiCard({ maLoi }: { maLoi: MaLoi }) {
  const bg = pastelBg(maLoi.id);
  const img = imageUrl(maLoi.hinhAnh?.[0]);

  return (
    <Link href={`/tra-cuu/${maLoi.id}`} className="group flex flex-col">
      <div className={cn("relative aspect-[4/3] overflow-hidden rounded-xl", bg)}>
        {img ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={img}
            alt={maLoi.tenLoi}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-3xl font-semibold text-[color:var(--color-ink-soft)]/60">
            {maLoi.maLoi}
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ring-1",
            MUC_DO_BADGE[maLoi.mucDo],
          )}
        >
          {MUC_DO_LABEL[maLoi.mucDo]}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-[color:var(--color-ink)] px-2 py-0.5 font-mono text-xs text-white">
            {maLoi.maLoi}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[color:var(--color-muted)]">
            <Eye className="size-3" />
            {maLoi.luotXem}
          </span>
        </div>
        <p className="text-sm font-medium text-[color:var(--color-ink)]">
          {maLoi.tenLoi}
        </p>
        {maLoi.tenThietBi && (
          <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
            {maLoi.tenThietBi}
            {maLoi.hangThietBi ? ` · ${maLoi.hangThietBi}` : ""}
          </p>
        )}
        {maLoi.moTa && (
          <p className="line-clamp-2 text-xs text-[color:var(--color-muted)]">
            {maLoi.moTa}
          </p>
        )}
      </div>
    </Link>
  );
}

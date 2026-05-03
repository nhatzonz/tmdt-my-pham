import Link from "next/link";
import { Cpu } from "lucide-react";
import { imageUrl, pastelBg } from "@/features/ma-loi/api";
import type { ThietBi } from "@/features/thiet-bi/api";
import { cn } from "@/lib/cn";

export function ThietBiCard({ thietBi }: { thietBi: ThietBi }) {
  const img = imageUrl(thietBi.hinhAnh);

  return (
    <Link
      href={`/tra-cuu?thietBiId=${thietBi.id}`}
      className="group flex flex-col"
    >
      <div
        className={cn(
          "relative flex aspect-square items-center justify-center overflow-hidden rounded-xl transition-transform group-hover:-translate-y-1",
          !img && pastelBg(thietBi.id),
        )}
      >
        {img ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={img}
            alt={thietBi.tenThietBi}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Cpu className="size-10 text-[color:var(--color-ink-soft)]/60" />
        )}
      </div>
      <p className="mt-3 text-sm font-medium">{thietBi.tenThietBi}</p>
      <p className="text-xs text-[color:var(--color-muted)]">
        {thietBi.hang ? `${thietBi.hang} · ` : ""}
        {thietBi.soMaLoi} mã lỗi
      </p>
    </Link>
  );
}

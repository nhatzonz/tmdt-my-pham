import Link from "next/link";
import type { Category } from "@/features/danh-muc/api";
import { pastelBg } from "@/features/san-pham/api";
import { cn } from "@/lib/cn";

export function CategoryCard({
  category,
  productCount,
}: {
  category: Category;
  productCount?: number;
}) {
  return (
    <Link
      href={`/san-pham?danhMucId=${category.id}`}
      className="group flex flex-col"
    >
      <div
        className={cn(
          "flex aspect-square items-center justify-center rounded-xl transition-transform group-hover:-translate-y-1",
          pastelBg(category.id),
        )}
      >
        <DropIcon />
      </div>
      <p className="mt-3 text-sm font-medium">{category.tenDanhMuc}</p>
      {productCount !== undefined && (
        <p className="text-xs text-[color:var(--color-muted)]">
          {productCount} sản phẩm
        </p>
      )}
    </Link>
  );
}

function DropIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="size-9 text-[color:var(--color-ink-soft)]/60"
    >
      <path
        d="M12 2.5c-3 5-6 8-6 12a6 6 0 0 0 12 0c0-4-3-7-6-12z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

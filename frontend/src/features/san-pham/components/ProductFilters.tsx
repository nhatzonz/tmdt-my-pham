"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/features/danh-muc/api";
import type { LoaiDa } from "@/features/san-pham/api";
import { cn } from "@/lib/cn";

const SKIN_TYPES: { value: LoaiDa; label: string }[] = [
  { value: "OILY", label: "Da dầu" },
  { value: "DRY", label: "Da khô" },
  { value: "COMBINATION", label: "Da hỗn hợp" },
  { value: "SENSITIVE", label: "Da nhạy cảm" },
  { value: "NORMAL", label: "Da thường" },
  { value: "ALL", label: "Tất cả loại da" },
];

const BRAND_INITIAL_LIMIT = 10;

type Props = {
  categories?: Category[];
  brandCounts?: { label: string; count: number }[];
  skinTypeCounts?: Partial<Record<LoaiDa, number>>;
  activeDanhMucIds?: number[];
  activeLoaiDas?: LoaiDa[];
  activeBrands?: string[];
  activePriceMin?: number;
  activePriceMax?: number;
  currentSort?: string;
};

export function ProductFilters({
  categories = [],
  brandCounts = [],
  skinTypeCounts = {},
  activeDanhMucIds = [],
  activeLoaiDas = [],
  activeBrands = [],
  activePriceMin,
  activePriceMax,
  currentSort,
}: Props) {
  const [showAllBrands, setShowAllBrands] = useState(false);

  const visibleBrands = showAllBrands
    ? brandCounts
    : brandCounts.slice(0, BRAND_INITIAL_LIMIT);
  const hiddenCount = brandCounts.length - BRAND_INITIAL_LIMIT;

  function buildHref(
    key: "danhMucId" | "loaiDa" | "thuongHieu",
    value: string,
  ): string {
    const next = {
      danhMucId: activeDanhMucIds.map(String),
      loaiDa: activeLoaiDas.map(String),
      thuongHieu: activeBrands.slice(),
    };
    const arr = next[key];
    const idx = arr.indexOf(value);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(value);

    const params = new URLSearchParams();
    for (const id of next.danhMucId) params.append("danhMucId", id);
    for (const v of next.loaiDa) params.append("loaiDa", v);
    for (const b of next.thuongHieu) params.append("thuongHieu", b);
    if (activePriceMin !== undefined) params.set("priceMin", String(activePriceMin));
    if (activePriceMax !== undefined) params.set("priceMax", String(activePriceMax));
    if (currentSort) params.set("sort", currentSort);
    const qs = params.toString();
    return qs ? `/san-pham?${qs}` : "/san-pham";
  }

  const clearAllHref = currentSort ? `/san-pham?sort=${currentSort}` : "/san-pham";

  return (
    <aside className="flex flex-col gap-7 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Bộ lọc</h3>
        <Link
          href={clearAllHref}
          className="text-xs text-[color:var(--color-muted)] underline underline-offset-4"
        >
          Xoá tất cả
        </Link>
      </div>

      {categories.length > 0 && (
        <FilterGroup title="Danh mục">
          {categories.map((c) => (
            <CheckRow
              key={c.id}
              label={c.tenDanhMuc}
              count={c.productCount}
              active={activeDanhMucIds.includes(c.id)}
              href={buildHref("danhMucId", String(c.id))}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Loại da">
        {SKIN_TYPES.map((s) => (
          <CheckRow
            key={s.value}
            label={s.label}
            count={skinTypeCounts[s.value] ?? 0}
            active={activeLoaiDas.includes(s.value)}
            href={buildHref("loaiDa", s.value)}
          />
        ))}
      </FilterGroup>

      {brandCounts.length > 0 && (
        <FilterGroup title="Thương hiệu">
          {visibleBrands.map((b) => (
            <CheckRow
              key={b.label}
              label={b.label}
              count={b.count}
              active={activeBrands.includes(b.label)}
              href={buildHref("thuongHieu", b.label)}
            />
          ))}
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllBrands((v) => !v)}
              className="mt-1 self-start text-xs text-[color:var(--color-ink)] underline underline-offset-4 hover:opacity-70"
            >
              {showAllBrands ? "Thu gọn" : `Xem thêm (${hiddenCount})`}
            </button>
          )}
        </FilterGroup>
      )}

    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details
      open
      className="group flex flex-col gap-3 [&>summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <p className="font-medium text-[color:var(--color-ink)]">{title}</p>
        <ChevronDown className="size-4 text-[color:var(--color-muted)] transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 flex flex-col gap-2.5">{children}</div>
    </details>
  );
}

function CheckRow({
  label,
  count,
  active,
  href,
}: {
  label: string;
  count: number;
  active?: boolean;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-md transition hover:text-[color:var(--color-ink)]">
      <span className="flex w-full items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2.5">
          <CheckBox checked={!!active} />
          <span
            className={cn(
              active
                ? "text-[color:var(--color-ink)]"
                : "text-[color:var(--color-ink-soft)]",
            )}
          >
            {label}
          </span>
        </span>
        <span className="text-xs text-[color:var(--color-muted)]">{count}</span>
      </span>
    </Link>
  );
}


function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-sm border",
        checked
          ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-white"
          : "border-[color:var(--color-border)] bg-white",
      )}
    >
      {checked && (
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-3"
        >
          <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MUC_DO_LABEL, type MucDo } from "@/features/ma-loi/api";
import type { ThietBi } from "@/features/thiet-bi/api";
import { cn } from "@/lib/cn";

const MUC_DOS: { value: MucDo; label: string }[] = [
  { value: "NHE", label: MUC_DO_LABEL.NHE },
  { value: "TRUNG_BINH", label: MUC_DO_LABEL.TRUNG_BINH },
  { value: "NGHIEM_TRONG", label: MUC_DO_LABEL.NGHIEM_TRONG },
];

type Props = {
  thietBis?: ThietBi[];
  mucDoCounts?: Partial<Record<MucDo, number>>;
  activeThietBiIds?: number[];
  activeMucDos?: MucDo[];
  currentSort?: string;
  currentQuery?: string;
};

export function MaLoiFilters({
  thietBis = [],
  mucDoCounts = {},
  activeThietBiIds = [],
  activeMucDos = [],
  currentSort,
  currentQuery,
}: Props) {
  function buildHref(key: "thietBiId" | "mucDo", value: string): string {
    const next = {
      thietBiId: activeThietBiIds.map(String),
      mucDo: activeMucDos.map(String),
    };
    const arr = next[key];
    const idx = arr.indexOf(value);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(value);

    const params = new URLSearchParams();
    for (const id of next.thietBiId) params.append("thietBiId", id);
    for (const v of next.mucDo) params.append("mucDo", v);
    if (currentSort) params.set("sort", currentSort);
    if (currentQuery) params.set("q", currentQuery);
    const qs = params.toString();
    return qs ? `/tra-cuu?${qs}` : "/tra-cuu";
  }

  const clearParams = new URLSearchParams();
  if (currentSort) clearParams.set("sort", currentSort);
  if (currentQuery) clearParams.set("q", currentQuery);
  const clearAllHref = clearParams.toString()
    ? `/tra-cuu?${clearParams.toString()}`
    : "/tra-cuu";

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

      {thietBis.length > 0 && (
        <FilterGroup title="Thiết bị">
          {thietBis.map((t) => (
            <CheckRow
              key={t.id}
              label={t.tenThietBi}
              count={t.soMaLoi}
              active={activeThietBiIds.includes(t.id)}
              href={buildHref("thietBiId", String(t.id))}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Mức độ">
        {MUC_DOS.map((m) => (
          <CheckRow
            key={m.value}
            label={m.label}
            count={mucDoCounts[m.value] ?? 0}
            active={activeMucDos.includes(m.value)}
            href={buildHref("mucDo", m.value)}
          />
        ))}
      </FilterGroup>
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

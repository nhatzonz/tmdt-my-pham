import Link from "next/link";
import { X } from "lucide-react";
import { MobileFilterDrawer } from "@/components/layout/MobileFilterDrawer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  maLoiApi,
  MUC_DO_LABEL,
  type MaLoi,
  type MucDo,
  type SortKey,
} from "@/features/ma-loi/api";
import { MaLoiCard } from "@/features/ma-loi/components/MaLoiCard";
import { MaLoiFilters } from "@/features/ma-loi/components/MaLoiFilters";
import { SortDropdown } from "@/features/ma-loi/components/SortDropdown";
import { thietBiApi } from "@/features/thiet-bi/api";

export const dynamic = "force-dynamic";

const MUC_DO_VALUES: MucDo[] = ["NHE", "TRUNG_BINH", "NGHIEM_TRONG"];

const SORT_OPTIONS: { value: SortKey | ""; label: string }[] = [
  { value: "", label: "Mới nhất" },
  { value: "luot_xem_desc", label: "Xem nhiều nhất" },
  { value: "ma_loi_asc", label: "Mã lỗi A → Z" },
];

type RawParams = {
  q?: string | string[];
  thietBiId?: string | string[];
  mucDo?: string | string[];
  sort?: string | string[];
};

type PageProps = {
  searchParams: Promise<RawParams>;
};

function asArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function countByMucDo(items: MaLoi[]): Partial<Record<MucDo, number>> {
  const counts: Partial<Record<MucDo, number>> = {};
  for (const v of MUC_DO_VALUES) counts[v] = 0;
  for (const m of items) counts[m.mucDo] = (counts[m.mucDo] ?? 0) + 1;
  return counts;
}

export default async function TraCuuPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const qRaw = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const q = qRaw.trim();
  const thietBiIds = asArray(params.thietBiId).map(Number).filter(Number.isFinite);
  const mucDos = asArray(params.mucDo).filter((v) =>
    MUC_DO_VALUES.includes(v as MucDo),
  ) as MucDo[];
  const sortRaw = (Array.isArray(params.sort) ? params.sort[0] : params.sort) ?? "";
  const sort: SortKey | undefined =
    sortRaw === "luot_xem_desc" || sortRaw === "ma_loi_asc" ? sortRaw : undefined;

  const baseList = q
    ? await maLoiApi.search(q).catch(() => [])
    : await maLoiApi
        .list({
          thietBiId: thietBiIds.length ? thietBiIds : undefined,
          mucDo: mucDos.length ? mucDos : undefined,
          sort,
        })
        .catch(() => []);

  const filteredList = q
    ? baseList.filter((m) => {
        if (thietBiIds.length && !thietBiIds.includes(m.thietBiId)) return false;
        if (mucDos.length && !mucDos.includes(m.mucDo)) return false;
        return true;
      })
    : baseList;

  const [allList, thietBis] = await Promise.all([
    maLoiApi.list().catch(() => []),
    thietBiApi.list().catch(() => []),
  ]);

  const mucDoCounts = countByMucDo(allList);
  const activeThietBis = thietBis.filter((t) => thietBiIds.includes(t.id));
  const titleThietBi = activeThietBis.length === 1 ? activeThietBis[0]! : null;

  function baseSortHref(value: SortKey | ""): string {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    for (const v of asArray(params.thietBiId)) sp.append("thietBiId", v);
    for (const v of asArray(params.mucDo)) sp.append("mucDo", v);
    if (value) sp.set("sort", value);
    const qs = sp.toString();
    return qs ? `/tra-cuu?${qs}` : "/tra-cuu";
  }

  function buildRemoveHref(
    key: "thietBiId" | "mucDo",
    removeValue: string,
  ): string {
    const next = {
      thietBiId: asArray(params.thietBiId),
      mucDo: asArray(params.mucDo),
    };
    next[key] = next[key].filter((v) => v !== removeValue);
    const sp = new URLSearchParams();
    for (const v of next.thietBiId) sp.append("thietBiId", v);
    for (const v of next.mucDo) sp.append("mucDo", v);
    if (q) sp.set("q", q);
    if (sort) sp.set("sort", sort);
    const qs = sp.toString();
    return qs ? `/tra-cuu?${qs}` : "/tra-cuu";
  }

  const hasAnyFilter = thietBiIds.length > 0 || mucDos.length > 0;

  return (
    <div className="mx-auto w-full px-4 py-6 md:w-4/5 md:px-6 md:py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          titleThietBi
            ? { label: titleThietBi.tenThietBi }
            : { label: "Tra cứu mã lỗi" },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl">
            {q
              ? `Kết quả cho "${q}"`
              : (titleThietBi?.tenThietBi ?? "Tất cả mã lỗi")}
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)] md:mt-3">
            {filteredList.length} mã lỗi
            {q ? "" : " · Tra cứu nhanh — kèm cách khắc phục"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <span className="text-xs text-[color:var(--color-muted)]">Sắp xếp theo</span>
          <SortDropdown
            options={SORT_OPTIONS.map((o) => ({
              label: o.label,
              href: baseSortHref(o.value),
              active: (sort ?? "") === o.value,
            }))}
          />
        </div>
      </div>

      <div className="mt-6 md:hidden">
        <MobileFilterDrawer>
          <MaLoiFilters
            thietBis={thietBis}
            mucDoCounts={mucDoCounts}
            activeThietBiIds={thietBiIds}
            activeMucDos={mucDos}
            currentSort={sort}
            currentQuery={q || undefined}
          />
        </MobileFilterDrawer>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <div className="hidden md:block">
          <MaLoiFilters
            thietBis={thietBis}
            mucDoCounts={mucDoCounts}
            activeThietBiIds={thietBiIds}
            activeMucDos={mucDos}
            currentSort={sort}
            currentQuery={q || undefined}
          />
        </div>

        <div>
          {hasAnyFilter && (
            <div className="mb-6 flex flex-wrap gap-2">
              {activeThietBis.map((t) => (
                <FilterChip
                  key={`tb-${t.id}`}
                  label={t.tenThietBi}
                  removeHref={buildRemoveHref("thietBiId", String(t.id))}
                />
              ))}
              {mucDos.map((v) => (
                <FilterChip
                  key={`md-${v}`}
                  label={MUC_DO_LABEL[v]}
                  removeHref={buildRemoveHref("mucDo", v)}
                />
              ))}
            </div>
          )}

          {filteredList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-white/50 p-12 text-center">
              <p className="text-sm text-[color:var(--color-muted)]">
                Chưa có mã lỗi nào khớp bộ lọc.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredList.map((m) => (
                <MaLoiCard key={m.id} maLoi={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, removeHref }: { label: string; removeHref: string }) {
  return (
    <Link
      href={removeHref}
      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-[color:var(--color-ink)] ring-1 ring-[color:var(--color-border)] hover:bg-[color:var(--color-ivory-2)]"
    >
      {label}
      <X className="size-3" />
    </Link>
  );
}

import Link from "next/link";
import { X } from "lucide-react";
import { InventoryRealtimeRefresher } from "@/components/realtime/InventoryRealtimeRefresher";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { categoryApi } from "@/features/danh-muc/api";
import {
  productApi,
  type LoaiDa,
  type Product,
  type SortKey,
} from "@/features/san-pham/api";
import { PriceFilter } from "@/features/san-pham/components/PriceFilter";
import { ProductCard } from "@/features/san-pham/components/ProductCard";
import { ProductFilters } from "@/features/san-pham/components/ProductFilters";
import { SortDropdown } from "@/features/san-pham/components/SortDropdown";

export const dynamic = "force-dynamic";

const LOAI_DA_VALUES: LoaiDa[] = [
  "OILY",
  "DRY",
  "COMBINATION",
  "SENSITIVE",
  "NORMAL",
  "ALL",
];

const LOAI_DA_LABEL: Record<LoaiDa, string> = {
  OILY: "Da dầu",
  DRY: "Da khô",
  COMBINATION: "Da hỗn hợp",
  SENSITIVE: "Da nhạy cảm",
  NORMAL: "Da thường",
  ALL: "Tất cả loại da",
};

type RawParams = {
  danhMucId?: string | string[];
  loaiDa?: string | string[];
  thuongHieu?: string | string[];
  priceMin?: string | string[];
  priceMax?: string | string[];
  sort?: string | string[];
};

const SORT_OPTIONS: { value: SortKey | ""; label: string }[] = [
  { value: "", label: "Phù hợp nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
];

type PageProps = {
  searchParams: Promise<RawParams>;
};

function asArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function countByLoaiDa(products: Product[]): Partial<Record<LoaiDa, number>> {
  const counts: Partial<Record<LoaiDa, number>> = {};
  for (const v of LOAI_DA_VALUES) counts[v] = 0;
  for (const p of products) {
    counts[p.loaiDa] = (counts[p.loaiDa] ?? 0) + 1;
  }
  return counts;
}

function countByBrand(products: Product[]): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of products) {
    if (!p.thuongHieu) continue;
    map.set(p.thuongHieu, (map.get(p.thuongHieu) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export default async function SanPhamPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const danhMucIds = asArray(params.danhMucId).map(Number).filter(Number.isFinite);
  const loaiDas = asArray(params.loaiDa) as LoaiDa[];
  const brands = asArray(params.thuongHieu);
  const priceMinRaw = Array.isArray(params.priceMin) ? params.priceMin[0] : params.priceMin;
  const priceMaxRaw = Array.isArray(params.priceMax) ? params.priceMax[0] : params.priceMax;
  const priceMinNum = priceMinRaw ? Number(priceMinRaw) : NaN;
  const priceMaxNum = priceMaxRaw ? Number(priceMaxRaw) : NaN;
  const priceMin = Number.isFinite(priceMinNum) && priceMinNum > 0 ? priceMinNum : undefined;
  const priceMax = Number.isFinite(priceMaxNum) && priceMaxNum > 0 ? priceMaxNum : undefined;
  const sortRaw = (Array.isArray(params.sort) ? params.sort[0] : params.sort) ?? "";
  const sort: SortKey | undefined =
    sortRaw === "price_asc" || sortRaw === "price_desc" ? sortRaw : undefined;

  const [filteredProducts, allProducts, categories] = await Promise.all([
    productApi
      .list({
        danhMucId: danhMucIds.length ? danhMucIds : undefined,
        loaiDa: loaiDas.length ? loaiDas : undefined,
        thuongHieu: brands.length ? brands : undefined,
        priceMin,
        priceMax,
        sort,
      })
      .catch(() => []),
    productApi.list().catch(() => []),
    categoryApi.list().catch(() => []),
  ]);

  const skinTypeCounts = countByLoaiDa(allProducts);
  const brandCounts = countByBrand(allProducts);
  const activeCategories = categories.filter((c) => danhMucIds.includes(c.id));
  const titleCategory = activeCategories.length === 1 ? activeCategories[0]! : null;

  function baseParams(overrides?: { sort?: string | null }): URLSearchParams {
    const sp = new URLSearchParams();
    for (const v of asArray(params.danhMucId)) sp.append("danhMucId", v);
    for (const v of asArray(params.loaiDa)) sp.append("loaiDa", v);
    for (const v of asArray(params.thuongHieu)) sp.append("thuongHieu", v);
    if (priceMin !== undefined) sp.set("priceMin", String(priceMin));
    if (priceMax !== undefined) sp.set("priceMax", String(priceMax));
    if (overrides && "sort" in overrides) {
      if (overrides.sort) sp.set("sort", overrides.sort);
    } else if (sort) {
      sp.set("sort", sort);
    }
    return sp;
  }

  function buildRemoveHref(
    key: "danhMucId" | "loaiDa" | "thuongHieu" | "price",
    removeValue?: string,
  ): string {
    const next = {
      danhMucId: asArray(params.danhMucId),
      loaiDa: asArray(params.loaiDa),
      thuongHieu: asArray(params.thuongHieu),
    };
    if (key !== "price" && removeValue !== undefined) {
      next[key] = next[key].filter((v) => v !== removeValue);
    }
    const sp = new URLSearchParams();
    for (const v of next.danhMucId) sp.append("danhMucId", v);
    for (const v of next.loaiDa) sp.append("loaiDa", v);
    for (const v of next.thuongHieu) sp.append("thuongHieu", v);
    if (key !== "price") {
      if (priceMin !== undefined) sp.set("priceMin", String(priceMin));
      if (priceMax !== undefined) sp.set("priceMax", String(priceMax));
    }
    if (sort) sp.set("sort", sort);
    const qs = sp.toString();
    return qs ? `/san-pham?${qs}` : "/san-pham";
  }

  function buildSortHref(value: SortKey | ""): string {
    const sp = baseParams({ sort: value || null });
    const qs = sp.toString();
    return qs ? `/san-pham?${qs}` : "/san-pham";
  }

  function formatPriceLabel(): string {
    const fmt = (n: number) => `${n.toLocaleString("vi-VN")}đ`;
    if (priceMin !== undefined && priceMax !== undefined) {
      return `${fmt(priceMin)} - ${fmt(priceMax)}`;
    }
    if (priceMin !== undefined) return `Từ ${fmt(priceMin)}`;
    if (priceMax !== undefined) return `Đến ${fmt(priceMax)}`;
    return "";
  }

  const hasAnyFilter =
    danhMucIds.length > 0 ||
    loaiDas.length > 0 ||
    brands.length > 0 ||
    priceMin !== undefined ||
    priceMax !== undefined;

  return (
    <div className="mx-auto w-4/5 px-6 py-10">
      <InventoryRealtimeRefresher />
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          titleCategory
            ? { label: titleCategory.tenDanhMuc }
            : { label: "Tất cả sản phẩm" },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl">
            {titleCategory?.tenDanhMuc ?? "Tất cả sản phẩm"}
          </h1>
          <p className="mt-3 text-sm text-[color:var(--color-muted)]">
            {filteredProducts.length} sản phẩm · Thành phần minh bạch — công thức dịu nhẹ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PriceFilter activePriceMin={priceMin} activePriceMax={priceMax} />
          <span className="text-xs text-[color:var(--color-muted)]">Sắp xếp theo</span>
          <SortDropdown
            options={SORT_OPTIONS.map((o) => ({
              label: o.label,
              href: buildSortHref(o.value),
              active: (sort ?? "") === o.value,
            }))}
          />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[240px_1fr]">
        <ProductFilters
          categories={categories}
          brandCounts={brandCounts}
          skinTypeCounts={skinTypeCounts}
          activeDanhMucIds={danhMucIds}
          activeLoaiDas={loaiDas}
          activeBrands={brands}
          activePriceMin={priceMin}
          activePriceMax={priceMax}
          currentSort={sort}
        />

        <div>
          {hasAnyFilter && (
            <div className="mb-6 flex flex-wrap gap-2">
              {activeCategories.map((c) => (
                <FilterChip
                  key={`cat-${c.id}`}
                  label={c.tenDanhMuc}
                  removeHref={buildRemoveHref("danhMucId", String(c.id))}
                />
              ))}
              {loaiDas.map((v) => (
                <FilterChip
                  key={`ld-${v}`}
                  label={LOAI_DA_LABEL[v]}
                  removeHref={buildRemoveHref("loaiDa", v)}
                />
              ))}
              {brands.map((b) => (
                <FilterChip
                  key={`br-${b}`}
                  label={b}
                  removeHref={buildRemoveHref("thuongHieu", b)}
                />
              ))}
              {(priceMin !== undefined || priceMax !== undefined) && (
                <FilterChip
                  label={formatPriceLabel()}
                  removeHref={buildRemoveHref("price")}
                />
              )}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-white/50 p-12 text-center">
              <p className="text-sm text-[color:var(--color-muted)]">
                Chưa có sản phẩm nào khớp bộ lọc.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
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

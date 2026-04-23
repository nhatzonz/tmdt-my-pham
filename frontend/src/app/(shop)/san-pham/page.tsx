import { X } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { categoryApi } from "@/features/danh-muc/api";
import { productApi, type LoaiDa } from "@/features/san-pham/api";
import { ProductCard } from "@/features/san-pham/components/ProductCard";
import { ProductFilters } from "@/features/san-pham/components/ProductFilters";

export const dynamic = "force-dynamic";

const LOAI_DA_LABEL: Record<LoaiDa, string> = {
  OILY: "Da dầu",
  DRY: "Da khô",
  COMBINATION: "Da hỗn hợp",
  SENSITIVE: "Da nhạy cảm",
  NORMAL: "Da thường",
  ALL: "Tất cả loại da",
};

type PageProps = {
  searchParams: Promise<{ danhMucId?: string; loaiDa?: string }>;
};

export default async function SanPhamPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const danhMucId = params.danhMucId ? Number(params.danhMucId) : undefined;
  const loaiDa = (params.loaiDa as LoaiDa | undefined) ?? undefined;

  const [products, categories] = await Promise.all([
    productApi.list({ danhMucId, loaiDa }).catch(() => []),
    categoryApi.list().catch(() => []),
  ]);

  const activeCategory = categories.find((c) => c.id === danhMucId);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          ...(activeCategory
            ? [{ label: activeCategory.tenDanhMuc }]
            : [{ label: "Tất cả sản phẩm" }]),
        ]}
      />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl">
            {activeCategory?.tenDanhMuc ?? "Tất cả sản phẩm"}
          </h1>
          <p className="mt-3 text-sm text-[color:var(--color-muted)]">
            {products.length} sản phẩm
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[240px_1fr]">
        <ProductFilters />

        <div>
          {(activeCategory || loaiDa) && (
            <div className="mb-6 flex flex-wrap gap-2">
              {activeCategory && (
                <FilterChip
                  label={activeCategory.tenDanhMuc}
                  removeHref={buildRemoveHref(params, "danhMucId")}
                />
              )}
              {loaiDa && (
                <FilterChip
                  label={LOAI_DA_LABEL[loaiDa]}
                  removeHref={buildRemoveHref(params, "loaiDa")}
                />
              )}
            </div>
          )}

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-white/50 p-12 text-center">
              <p className="text-sm text-[color:var(--color-muted)]">
                Chưa có sản phẩm nào khớp bộ lọc.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
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

function buildRemoveHref(
  params: Record<string, string | undefined>,
  removeKey: string,
): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k !== removeKey && v) next.set(k, v);
  }
  const qs = next.toString();
  return qs ? `/san-pham?${qs}` : "/san-pham";
}

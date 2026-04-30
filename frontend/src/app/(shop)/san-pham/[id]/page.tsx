import Link from "next/link";
import { notFound } from "next/navigation";
import { Leaf, RotateCcw, Truck } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { categoryApi } from "@/features/danh-muc/api";
import { pastelBg, productApi, type Product } from "@/features/san-pham/api";
import { ProductCard } from "@/features/san-pham/components/ProductCard";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { AddToCartBlock } from "./AddToCartBlock";
import { ProductGallery } from "./ProductGallery";

export const dynamic = "force-dynamic";

const LOAI_DA_LABEL: Record<Product["loaiDa"], string> = {
  OILY: "Da dầu",
  DRY: "Da khô",
  COMBINATION: "Da hỗn hợp",
  SENSITIVE: "Da nhạy cảm",
  NORMAL: "Da thường",
  ALL: "Tất cả loại da",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SanPhamDetailPage({ params }: PageProps) {
  const { id } = await params;

  let product: Product;
  try {
    product = await productApi.getById(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const [categories, sameCategoryProducts] = await Promise.all([
    categoryApi.list().catch(() => []),
    productApi.list({ danhMucId: [product.danhMucId] }).catch(() => []),
  ]);

  const category = categories.find((c) => c.id === product.danhMucId);
  const related = sameCategoryProducts.filter((p) => p.id !== product.id).slice(0, 4);
  const bg = pastelBg(product.id);
  const brand = (product.thuongHieu ?? "").toUpperCase();
  const productCode = product.maSanPham ?? `NL-${String(product.id).padStart(3, "0")}`;

  return (
    <div className="mx-auto w-4/5 px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tất cả sản phẩm", href: "/san-pham" },
          ...(category
            ? [
                {
                  label: category.tenDanhMuc,
                  href: `/san-pham?danhMucId=${category.id}`,
                },
              ]
            : []),
          { label: product.tenSanPham },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* GALLERY */}
        <ProductGallery
          images={product.hinhAnh}
          alt={product.tenSanPham}
          fallbackBg={bg}
        />

        {/* INFO */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
            {brand && <span>{brand}</span>}
            {brand && category && <span>·</span>}
            {category && (
              <Link
                href={`/san-pham?danhMucId=${category.id}`}
                className="hover:text-[color:var(--color-ink)]"
              >
                {category.tenDanhMuc}
              </Link>
            )}
          </div>

          <h1 className="font-serif text-4xl leading-tight md:text-5xl">
            {product.tenSanPham}
          </h1>

          {product.moTa && (
            <p className="text-sm text-[color:var(--color-muted)]">{product.moTa}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge>Loại da: {LOAI_DA_LABEL[product.loaiDa]}</Badge>
            {product.thuongHieu && (
              <Badge>Thương hiệu: {product.thuongHieu}</Badge>
            )}
            {product.hetHang ? (
              <Badge tone="error">Hết hàng</Badge>
            ) : (
              <Badge tone="ok">Còn hàng</Badge>
            )}
          </div>

          <div className="flex items-baseline gap-4">
            <span className="font-serif text-4xl">{formatCurrency(product.gia)}</span>
          </div>

          <AddToCartBlock
            productId={product.id}
            price={Number(product.gia)}
            hetHang={product.hetHang}
            soLuongTon={product.soLuongTon}
          />

          <div className="grid grid-cols-3 gap-2">
            <InfoTile icon={<Truck className="size-4" />} label="Free ship từ 500K" />
            <InfoTile icon={<RotateCcw className="size-4" />} label="Đổi trả 15 ngày" />
            <InfoTile
              icon={<Leaf className="size-4" />}
              label="Thuần chay · Cruelty-free"
            />
          </div>

          {/* Specs */}
          <div className="mt-2 rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
            <p className="mb-3 text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Thông số
            </p>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <SpecRow label="Mã sản phẩm" value={productCode} />
              <SpecRow label="Loại da" value={LOAI_DA_LABEL[product.loaiDa]} />
              {product.thuongHieu && (
                <SpecRow label="Thương hiệu" value={product.thuongHieu} />
              )}
              {category && <SpecRow label="Danh mục" value={category.tenDanhMuc} />}
            </dl>
          </div>
        </div>
      </div>

      {/* DESCRIPTION FULL */}
      {product.moTa && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl md:text-3xl">Mô tả</h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
            {product.moTa}
          </p>
        </section>
      )}

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-serif text-2xl md:text-3xl">Sản phẩm liên quan</h2>
            {category && (
              <Link
                href={`/san-pham?danhMucId=${category.id}`}
                className="text-sm underline underline-offset-4 hover:text-[color:var(--color-ink)]"
              >
                Xem tất cả {category.tenDanhMuc}
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "ok" | "error";
}) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs",
        tone === "ok" &&
          "bg-[color:var(--color-pastel-mint)] text-[color:var(--color-ink-soft)]",
        tone === "error" && "bg-rose-100 text-rose-700",
        tone === "default" &&
          "bg-[color:var(--color-ivory-2)] text-[color:var(--color-ink-soft)]",
      )}
    >
      {children}
    </span>
  );
}

function InfoTile({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/50 px-3 py-2.5 text-xs">
      <span className="text-[color:var(--color-muted)]">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[color:var(--color-border)] pb-2 last:border-0 last:pb-0">
      <dt className="text-xs text-[color:var(--color-muted)]">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

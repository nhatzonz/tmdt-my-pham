"use client";

import { useState } from "react";
import { Heart, Leaf, RotateCcw, Truck } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { pastelBg, type Product } from "@/features/san-pham/api";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

const THUMB_COUNT = 5;

export function ProductDetailClient({ product }: { product: Product }) {
  const [selectedThumb, setSelectedThumb] = useState(0);

  const bg = pastelBg(product.id);
  const brand = (product.thuongHieu ?? "LUMIÈRE").toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm", href: "/san-pham" },
          { label: product.tenSanPham },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[80px_1fr_1fr]">
        <div className="flex flex-row gap-3 lg:flex-col">
          {Array.from({ length: THUMB_COUNT }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedThumb(i)}
              className={cn(
                "aspect-square size-16 overflow-hidden rounded-lg ring-2 transition lg:size-20",
                bg,
                selectedThumb === i
                  ? "ring-[color:var(--color-ink)]"
                  : "ring-transparent hover:ring-[color:var(--color-border)]",
              )}
              aria-label={`Ảnh ${i + 1}`}
            >
              <div className="flex h-full items-center justify-center">
                <div className="h-2/3 w-1/3 rounded bg-white/80" />
              </div>
            </button>
          ))}
        </div>

        <div
          className={cn(
            "relative flex aspect-square items-center justify-center rounded-2xl",
            bg,
          )}
        >
          <div className="flex h-[70%] w-[30%] flex-col items-center justify-between rounded-2xl bg-white/90 px-4 py-8 shadow-lg">
            <span className="font-serif text-sm italic">
              {brand === "LUMIÈRE" ? "Lumière" : brand}
            </span>
            <div className="h-20 w-full rounded bg-[color:var(--color-pastel-beige)]/40" />
            <div className="text-center text-[9px] uppercase tracking-wider text-[color:var(--color-muted)]">
              <p>LM-{String(product.id).padStart(3, "0")}</p>
              <p>{product.loaiDa}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
            {brand}
          </p>
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">
            {product.tenSanPham}
          </h1>
          {product.moTa && (
            <p className="text-sm text-[color:var(--color-muted)]">{product.moTa}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-[color:var(--color-ivory-2)] px-3 py-1 text-xs">
              Loại da: {product.loaiDa}
            </span>
            {product.thuongHieu && (
              <span className="text-xs text-[color:var(--color-muted)]">
                Thương hiệu: <strong>{product.thuongHieu}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="font-serif text-3xl">{formatCurrency(product.gia)}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button size="lg" className="flex-1" disabled>
              Thêm vào giỏ (sẵn Tuần 8)
            </Button>
            <button
              aria-label="Lưu"
              className="rounded-full border border-[color:var(--color-border)] p-3"
              disabled
            >
              <Heart className="size-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <InfoTile icon={<Truck className="size-4" />} label="Free ship từ 500K" />
            <InfoTile icon={<RotateCcw className="size-4" />} label="Đổi trả 15 ngày" />
            <InfoTile
              icon={<Leaf className="size-4" />}
              label="Thuần chay · Cruelty-free"
            />
          </div>
        </div>
      </div>
    </div>
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

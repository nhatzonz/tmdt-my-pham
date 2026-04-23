"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { pastelBg, type Product } from "@/features/san-pham/api";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const bg = pastelBg(product.id);
  const brand = (product.thuongHieu ?? "LUMIÈRE").toUpperCase();

  return (
    <Link href={`/san-pham/${product.id}`} className="group flex flex-col">
      <div className={cn("relative aspect-square overflow-hidden rounded-xl", bg)}>
        <button
          type="button"
          aria-label="Lưu"
          className="absolute bottom-3 right-3 rounded-full bg-white/80 p-2 backdrop-blur transition hover:bg-white"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <Bookmark className="size-4" />
        </button>
        <div className="flex h-full items-center justify-center">
          <div className="h-2/3 w-1/3 rounded-md bg-white/70 shadow-sm transition-transform group-hover:-translate-y-1" />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
          {brand}
        </span>
        <p className="text-sm font-medium text-[color:var(--color-ink)]">
          {product.tenSanPham}
        </p>
        {product.moTa && (
          <p className="line-clamp-2 text-xs text-[color:var(--color-muted)]">
            {product.moTa}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base text-[color:var(--color-ink)]">
            {formatCurrency(product.gia)}
          </span>
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
            {product.loaiDa}
          </span>
        </div>
      </div>
    </Link>
  );
}

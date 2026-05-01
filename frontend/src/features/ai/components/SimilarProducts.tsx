"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { aiApi, aiItemToProduct, type AIRecommendItem } from "@/features/ai/api";
import { ProductCard } from "@/features/san-pham/components/ProductCard";

/**
 * Section "Sản phẩm tương tự" — hiển thị trên trang chi tiết sp.
 * Strategy SIMILAR (BE dùng embedding của chính sp đang xem để tìm láng giềng cosine).
 */
export function SimilarProducts({ productId }: { productId: number }) {
  const [items, setItems] = useState<AIRecommendItem[] | null>(null);

  useEffect(() => {
    aiApi
      .similar(productId, 4)
      .then((res) => setItems(res.items ?? []))
      .catch((err) => {
        console.warn("[SimilarProducts]", err);
        setItems([]);
      });
  }, [productId]);

  if (items === null) return null;
  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full px-4 pb-16 md:w-4/5 md:px-6 md:pb-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[color:var(--color-primary)]">
            <Sparkles className="size-3" />
            Gợi ý AI
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">Sản phẩm tương tự</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.sanPhamId}
            onClick={() =>
              aiApi.trackClick(item.sanPhamId, "PRODUCT_DETAIL").catch(() => {})
            }
          >
            <ProductCard product={aiItemToProduct(item)} />
          </div>
        ))}
      </div>
    </section>
  );
}

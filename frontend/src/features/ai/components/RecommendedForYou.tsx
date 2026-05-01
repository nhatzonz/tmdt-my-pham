"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { aiApi, aiItemToProduct, type AIRecommendItem } from "@/features/ai/api";
import { ProductCard } from "@/features/san-pham/components/ProductCard";
import { authStorage } from "@/lib/auth-storage";

/**
 * Widget "Dành riêng cho bạn" — hiển thị trên home khi đã login.
 * Strategy: BE chọn PERSONALIZED nếu user có order history, fallback POPULAR.
 */
export function RecommendedForYou() {
  const [items, setItems] = useState<AIRecommendItem[] | null>(null);
  const [strategy, setStrategy] = useState<string | null>(null);

  useEffect(() => {
    const user = authStorage.getUser();
    if (!user) {
      setItems([]);
      return;
    }
    aiApi
      .recommendForUser(user.id, 6)
      .then((res) => {
        setItems(res.items ?? []);
        setStrategy(res.strategy ?? null);
      })
      .catch((err) => {
        console.warn("[RecommendedForYou]", err);
        setItems([]);
      });
  }, []);

  // Loading state — render nothing để không nháy section trống
  if (items === null) return null;
  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-4/5 px-6 pb-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[color:var(--color-primary)]">
            <Sparkles className="size-3" />
            {strategy === "PERSONALIZED" ? "Gợi ý AI" : "Đang được yêu thích"}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl">Dành riêng cho bạn</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.sanPhamId}
            onClick={() =>
              aiApi.trackClick(item.sanPhamId, "HOMEPAGE").catch(() => {})
            }
          >
            <ProductCard product={aiItemToProduct(item)} />
          </div>
        ))}
      </div>
    </section>
  );
}

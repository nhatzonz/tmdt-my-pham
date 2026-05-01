"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { subscribeInventory } from "@/lib/inventory-socket";

/**
 * Client Component invisible — gắn vào Server Component page để khi BE publish
 * event /topic/inventory thì Next.js refetch + re-render server tree (ProductCard,
 * detail badge "Hết hàng", v.v).
 *
 * Throttle 800ms để khi có nhiều event gần nhau (vd nhiều sp cùng update) chỉ
 * refresh một lần thay vì spam.
 */
export function InventoryRealtimeRefresher({ productId }: { productId?: number }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeInventory((event) => {
      // Nếu component dùng cho 1 sp cụ thể (detail page) → chỉ refresh khi đúng sp đó.
      if (productId !== undefined && event.sanPhamId !== productId) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 800);
    });
  }, [router, productId]);

  return null;
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { subscribeInventory } from "@/lib/inventory-socket";

export function InventoryRealtimeRefresher({ productId }: { productId?: number }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeInventory((event) => {

      if (productId !== undefined && event.sanPhamId !== productId) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 800);
    });
  }, [router, productId]);

  return null;
}

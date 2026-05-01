"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";

export function MobileFilterDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const drawer = open && (
    <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            aria-label="Đóng bộ lọc"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-black/5 bg-white px-5 py-4">
              <span className="font-serif text-lg">Bộ lọc</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="text-[color:var(--color-ink-soft)]"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
            <div className="sticky bottom-0 border-t border-black/5 bg-white p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-full bg-[color:var(--color-primary)] py-3 text-sm text-white"
              >
                Xem kết quả
              </button>
            </div>
          </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm text-[color:var(--color-ink)] shadow-sm md:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Bộ lọc
      </button>
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}

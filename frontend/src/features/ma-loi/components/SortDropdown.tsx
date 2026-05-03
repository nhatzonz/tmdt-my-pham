"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export type SortOption = {
  label: string;
  href: string;
  active: boolean;
};

export function SortDropdown({ options }: { options: SortOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.active) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-white/80 px-4 py-2 text-sm"
      >
        {current?.label}
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-[color:var(--color-border)]"
        >
          {options.map((o) => (
            <Link
              key={o.label}
              href={o.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 text-sm transition hover:bg-[color:var(--color-ivory-2)]",
                o.active && "bg-[color:var(--color-ivory-2)] font-medium",
              )}
            >
              {o.label}
              {o.active && <Check className="size-4" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

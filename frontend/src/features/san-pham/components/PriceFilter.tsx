"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  activePriceMin?: number;
  activePriceMax?: number;
};

export function PriceFilter({ activePriceMin, activePriceMax }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [priceMin, setPriceMin] = useState<string>(
    activePriceMin !== undefined ? String(activePriceMin) : "",
  );
  const [priceMax, setPriceMax] = useState<string>(
    activePriceMax !== undefined ? String(activePriceMax) : "",
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPriceMin(activePriceMin !== undefined ? String(activePriceMin) : "");
    setPriceMax(activePriceMax !== undefined ? String(activePriceMax) : "");
  }, [activePriceMin, activePriceMax]);

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

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("priceMin");
    params.delete("priceMax");
    const minN = Number(priceMin);
    const maxN = Number(priceMax);
    if (priceMin && Number.isFinite(minN) && minN > 0) params.set("priceMin", String(minN));
    if (priceMax && Number.isFinite(maxN) && maxN > 0) params.set("priceMax", String(maxN));
    const qs = params.toString();
    setOpen(false);
    router.push(qs ? `/san-pham?${qs}` : "/san-pham");
  }

  function clearPrice() {
    setPriceMin("");
    setPriceMax("");
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("priceMin");
    params.delete("priceMax");
    const qs = params.toString();
    setOpen(false);
    router.push(qs ? `/san-pham?${qs}` : "/san-pham");
  }

  const priceActive =
    activePriceMin !== undefined || activePriceMax !== undefined;
  const buttonLabel = priceActive ? labelOf(activePriceMin, activePriceMax) : "Giá";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-sm",
          priceActive
            ? "border-[color:var(--color-ink)]"
            : "border-[color:var(--color-border)]",
        )}
      >
        {buttonLabel}
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <form
          onSubmit={applyPrice}
          className="absolute right-0 z-20 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl bg-white p-4 shadow-lg ring-1 ring-[color:var(--color-border)]"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  Từ
                </label>
                {formatShort(priceMin) && (
                  <span className="text-[10px] font-medium text-[color:var(--color-ink-soft)]">
                    {formatShort(priceMin)}
                  </span>
                )}
              </div>
              <input
                type="number"
                min={0}
                step={1000}
                placeholder="0"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--color-ink)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  Đến
                </label>
                {formatShort(priceMax) && (
                  <span className="text-[10px] font-medium text-[color:var(--color-ink-soft)]">
                    {formatShort(priceMax)}
                  </span>
                )}
              </div>
              <input
                type="number"
                min={0}
                step={1000}
                placeholder="∞"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="rounded-lg border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--color-ink)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 rounded-full bg-[color:var(--color-ink)] px-4 py-2 text-xs text-white transition hover:bg-black"
            >
              Áp dụng
            </button>
            {priceActive && (
              <button
                type="button"
                onClick={clearPrice}
                className="text-xs text-[color:var(--color-muted)] underline underline-offset-4"
              >
                Xoá
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function labelOf(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) {
    return `${formatShort(String(min))} - ${formatShort(String(max))}`;
  }
  if (min !== undefined) return `Từ ${formatShort(String(min))}`;
  if (max !== undefined) return `Đến ${formatShort(String(max))}`;
  return "Giá";
}

function formatShort(raw: string): string {
  const n = Number(raw);
  if (!raw || !Number.isFinite(n) || n <= 0) return "";
  if (n >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (n >= 1000) return `${trim(n / 1000)}k`;
  return String(n);
}

function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}

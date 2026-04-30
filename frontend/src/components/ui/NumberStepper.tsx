"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export function NumberStepper({ value, onChange, min = 1, max = 99, className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[color:var(--color-border)]",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Giảm"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="cursor-pointer p-2.5 text-[color:var(--color-ink)] transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-7 text-center text-sm">{value}</span>
      <button
        type="button"
        aria-label="Tăng"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="cursor-pointer p-2.5 text-[color:var(--color-ink)] transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

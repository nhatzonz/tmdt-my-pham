import { cn } from "@/lib/cn";

export type BadgeTone = "default" | "new" | "bestseller" | "eco" | "ok" | "error";

const tones: Record<BadgeTone, string> = {
  default: "bg-white/90 text-[color:var(--color-ink-soft)]",
  new: "bg-[color:var(--color-pastel-beige)] text-[color:var(--color-ink-soft)]",
  bestseller: "bg-[color:var(--color-pastel-cream)] text-[color:var(--color-ink-soft)]",
  eco: "bg-[color:var(--color-pastel-mint)] text-[color:var(--color-ink-soft)]",
  ok: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  error: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export function Badge({
  tone = "default",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

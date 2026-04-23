import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean };

export function FilterPill({ active, className, ...rest }: Props) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs transition",
        active
          ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-white"
          : "border-[color:var(--color-border)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]",
        className,
      )}
      {...rest}
    />
  );
}

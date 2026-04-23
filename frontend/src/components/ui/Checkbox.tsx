import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: React.ReactNode;
  count?: number;
};

export const Checkbox = forwardRef<HTMLInputElement, Props>(
  ({ label, count, className, ...rest }, ref) => (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
      <span className="inline-flex items-center gap-2.5">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "size-4 rounded-sm accent-[color:var(--color-ink)]",
            className,
          )}
          {...rest}
        />
        {label && <span className="text-[color:var(--color-ink-soft)]">{label}</span>}
      </span>
      {count !== undefined && (
        <span className="text-xs text-[color:var(--color-muted)]">{count}</span>
      )}
    </label>
  ),
);
Checkbox.displayName = "Checkbox";

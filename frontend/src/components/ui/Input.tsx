import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightAdornment?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, hint, leftIcon, rightAdornment, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]"
          >
            {label}
            {rest.required && <span className="ml-1 text-rose-600">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm outline-none transition focus:border-[color:var(--color-ink)]",
              !!leftIcon && "pl-11",
              !!rightAdornment && "pr-11",
              className,
            )}
            {...rest}
          />
          {rightAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightAdornment}</div>
          )}
        </div>
        {hint && <p className="text-xs text-[color:var(--color-muted)]">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

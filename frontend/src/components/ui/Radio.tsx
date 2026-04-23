import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: React.ReactNode;
};

export const Radio = forwardRef<HTMLInputElement, Props>(
  ({ label, className, ...rest }, ref) => (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm">
      <input
        ref={ref}
        type="radio"
        className={cn("size-4 accent-[color:var(--color-ink)]", className)}
        {...rest}
      />
      {label && <span className="text-[color:var(--color-ink)]">{label}</span>}
    </label>
  ),
);
Radio.displayName = "Radio";

import { Star } from "lucide-react";

export function Rating({
  value,
  reviewCount,
  showCount = true,
}: {
  value: number;
  reviewCount?: number;
  showCount?: boolean;
}) {
  const rounded = Math.round(value);
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={
              i <= rounded
                ? "size-4 fill-amber-500 text-amber-500"
                : "size-4 text-[color:var(--color-border)]"
            }
          />
        ))}
      </div>
      <span className="text-sm text-[color:var(--color-ink)]">{value.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-[color:var(--color-muted)]">
          · {reviewCount} đánh giá
        </span>
      )}
    </div>
  );
}

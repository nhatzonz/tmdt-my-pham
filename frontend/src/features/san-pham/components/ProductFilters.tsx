import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

/**
 * Sidebar UI — hiện tại static (chưa wire filter).
 * Filter danh mục / loại da đang dùng query string (?danhMucId=, ?loaiDa=) — xem link phía dưới.
 * Sẽ làm functional đầy đủ khi có pagination (Tuần 7 mở rộng).
 */
export function ProductFilters() {
  return (
    <aside className="flex flex-col gap-8 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Bộ lọc</h3>
        <Link
          href="/san-pham"
          className="text-xs text-[color:var(--color-muted)] underline underline-offset-4"
        >
          Xoá tất cả
        </Link>
      </div>

      <FilterGroup title="Loại da">
        <FilterLink href="/san-pham?loaiDa=OILY" label="Da dầu" />
        <FilterLink href="/san-pham?loaiDa=DRY" label="Da khô" />
        <FilterLink href="/san-pham?loaiDa=COMBINATION" label="Da hỗn hợp" />
        <FilterLink href="/san-pham?loaiDa=SENSITIVE" label="Da nhạy cảm" />
        <FilterLink href="/san-pham?loaiDa=NORMAL" label="Da thường" />
        <FilterLink href="/san-pham?loaiDa=ALL" label="Tất cả" />
      </FilterGroup>

      <FilterGroup title="Thành phần">
        <Checkbox label="Niacinamide" disabled />
        <Checkbox label="Hyaluronic acid" disabled />
        <Checkbox label="Retinol / Retinal" disabled />
        <Checkbox label="Vitamin C" disabled />
        <Checkbox label="Ceramide" disabled />
      </FilterGroup>

      <div className="flex flex-col gap-3">
        <p className="font-medium text-[color:var(--color-ink)]">Giá</p>
        <div className="relative h-1 rounded-full bg-[color:var(--color-border)]">
          <div className="absolute inset-0 rounded-full bg-[color:var(--color-ink)]/30" />
        </div>
        <p className="text-xs text-[color:var(--color-muted)]">
          Bộ lọc giá — sẽ bật khi có pagination
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-ivory-2)]/60 p-4">
        <p className="mb-1 text-xs font-medium">✦ Chưa biết chọn?</p>
        <p className="mb-3 text-xs text-[color:var(--color-muted)]">
          Quiz AI sẽ gợi ý trong 90 giây (Phase 3).
        </p>
        <Button size="sm" className="w-full" disabled>
          Bắt đầu quiz
        </Button>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium text-[color:var(--color-ink)]">{title}</p>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FilterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
    >
      {label}
    </Link>
  );
}

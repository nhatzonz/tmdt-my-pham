import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-muted)]"
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="transition hover:text-[color:var(--color-ink)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[color:var(--color-ink)]">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

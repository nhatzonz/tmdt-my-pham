import Link from "next/link";
import { cn } from "@/lib/cn";

export function AuthTabs({ active }: { active: "dang-nhap" | "dang-ky" }) {
  const tabs = [
    { id: "dang-nhap", label: "Đăng nhập", href: "/dang-nhap" },
    { id: "dang-ky", label: "Đăng ký", href: "/dang-ky" },
  ] as const;
  return (
    <div className="inline-flex rounded-full bg-[color:var(--color-ivory-2)] p-1">
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm transition",
            active === t.id
              ? "bg-[color:var(--color-ink)] text-white"
              : "text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]",
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

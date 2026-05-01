import Link from "next/link";
import { cn } from "@/lib/cn";

export function AuthTabs({ active }: { active: "dang-nhap" | "dang-ky" }) {
  const tabs = [
    { id: "dang-nhap", label: "Đăng nhập", href: "/dang-nhap" },
    { id: "dang-ky", label: "Đăng ký", href: "/dang-ky" },
  ] as const;
  return (
    <div className="flex w-full rounded-full bg-[color:var(--color-ivory-2)] p-1 ring-1 ring-black/5">
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={cn(
            "flex-1 rounded-full py-1.5 text-center text-sm font-medium transition",
            active === t.id
              ? "bg-[color:var(--color-ink)] text-white shadow-sm"
              : "text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]",
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Boxes, History, LayoutDashboard, LogOut, Package, Receipt, Tag, Ticket } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "Dashboard", href: "/quan-tri", icon: LayoutDashboard },
  { label: "Danh mục", href: "/quan-tri/danh-muc", icon: Tag },
  { label: "Sản phẩm", href: "/quan-tri/san-pham", icon: Package },
  { label: "Tồn kho", href: "/quan-tri/ton-kho", icon: Boxes },
  { label: "Lịch sử kho", href: "/quan-tri/ton-kho/lich-su", icon: History },
  { label: "Khuyến mãi", href: "/quan-tri/khuyen-mai", icon: Ticket },
  { label: "Đơn hàng", href: "/quan-tri/don-hang", icon: Receipt },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loaded, logout } = useAuth();

  useEffect(() => {
    if (!loaded) return;
    if (!user) {
      router.replace("/dang-nhap");
      return;
    }
    if (user.vaiTro !== "ADMIN") {
      router.replace("/");
    }
  }, [loaded, user, router]);

  function handleLogout() {
    logout();
    router.replace("/dang-nhap");
  }

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--color-ivory)] text-sm text-[color:var(--color-muted)]">
        Đang kiểm tra phiên...
      </div>
    );
  }
  if (!user || user.vaiTro !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[color:var(--color-ivory)]">
      <aside className="flex w-64 flex-col border-r border-[color:var(--color-border)] bg-white p-6">
        <Link href="/quan-tri" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ngọc Lan Beauty"
            width={40}
            height={40}
            className="size-10 object-contain"
            priority
          />
          <span className="font-serif text-xl italic leading-none">Ngọc Lan Beauty</span>
          <span className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
            Admin
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-[color:var(--color-ink)] text-white"
                    : "text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-ivory-2)]",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[color:var(--color-border)] pt-6">
          <p className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
            Đăng nhập
          </p>
          <p className="mt-1 text-sm font-medium">{user.hoTen}</p>
          <p className="text-xs text-[color:var(--color-muted)]">{user.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            <LogOut className="size-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Package, Search, ShoppingBag, User } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { Category } from "@/features/danh-muc/api";
import { useCart } from "@/features/gio-hang/hooks/use-cart";

const STATIC_NAV = [{ label: "Sản phẩm", href: "/san-pham" }];

export function Header({ categories = [] }: { categories?: Category[] }) {
  const { user, loaded, logout } = useAuth();
  const { totalCount } = useCart();
  const topCategories = categories.slice(0, 3);

  function handleLogout() {
    logout();
    window.location.replace("/dang-nhap");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-white/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-10 px-6 py-4">
        <Link href={routes.home} className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ngọc Lan Beauty"
            width={48}
            height={48}
            className="size-12 object-contain"
            priority
          />
          <span className="font-serif text-2xl italic leading-none">Ngọc Lan Beauty</span>
        </Link>

        <nav className="flex flex-1 items-center gap-7 text-sm">
          {STATIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
          {topCategories.map((c) => (
            <Link
              key={c.id}
              href={`/san-pham?danhMucId=${c.id}`}
              className="text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
            >
              {c.tenDanhMuc}
            </Link>
          ))}
        </nav>

        <div className="relative hidden w-72 md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-muted)]" />
          <input
            type="search"
            placeholder="Tìm serum, son, kem chống nắng..."
            className="w-full rounded-full border border-[color:var(--color-border)] bg-white/60 py-2 pl-10 pr-4 text-sm placeholder:text-[color:var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ink-soft)]/20"
          />
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/gio-hang"
            aria-label="Giỏ hàng"
            className="relative text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
          >
            <ShoppingBag className="size-5" />
            {totalCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex size-4 items-center justify-center rounded-full bg-[color:var(--color-ink)] px-1 text-[10px] text-white">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </Link>
          {!loaded ? (
            <div className="size-5" aria-hidden />
          ) : user ? (
            <>
              <Link
                href="/don-hang"
                aria-label="Đơn hàng của tôi"
                title="Đơn hàng của tôi"
                className="text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
              >
                <Package className="size-5" />
              </Link>
              <span
                className="flex size-8 items-center justify-center rounded-full bg-[color:var(--color-pastel-blush)] text-xs font-medium text-[color:var(--color-ink)]"
                title={user.hoTen}
              >
                {getInitials(user.hoTen)}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Đăng xuất"
                className="text-[color:var(--color-muted)] transition hover:text-[color:var(--color-ink)]"
              >
                <LogOut className="size-5" />
              </button>
            </>
          ) : (
            <Link href="/dang-nhap" aria-label="Đăng nhập">
              <User className="size-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function getInitials(hoTen: string): string {
  const parts = hoTen.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

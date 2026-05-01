"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Package, ShoppingCart, User } from "lucide-react";
import { SearchBox } from "@/components/layout/SearchBox";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { StoreConfig } from "@/features/cau-hinh/api";
import type { Category } from "@/features/danh-muc/api";
import { orderApi } from "@/features/don-hang/api";
import { useCart } from "@/features/gio-hang/hooks/use-cart";
import { imageUrl } from "@/features/san-pham/api";

const STATIC_NAV = [{ label: "Sản phẩm", href: "/san-pham" }];

export function Header({
  categories = [],
  storeConfig,
}: {
  categories?: Category[];
  storeConfig?: StoreConfig | null;
}) {
  const { user, loaded, logout } = useAuth();
  const { totalCount } = useCart();
  const [orderCount, setOrderCount] = useState(0);
  const topCategories = categories.slice(0, 3);
  const tenCuaHang = storeConfig?.tenCuaHang || "Ngọc Lan Beauty";
  const logoSrc = (storeConfig?.logoUrl && imageUrl(storeConfig.logoUrl)) || "/logo.png";

  // Đếm đơn đang hoạt động (PENDING + SHIPPING) — không tính COMPLETED/CANCELLED.
  useEffect(() => {
    if (!loaded || !user) {
      setOrderCount(0);
      return;
    }
    let cancelled = false;
    orderApi
      .mine()
      .then((orders) => {
        if (cancelled) return;
        const active = orders.filter(
          (o) => o.trangThai === "PENDING" || o.trangThai === "SHIPPING",
        );
        setOrderCount(active.length);
      })
      .catch(() => {
        if (!cancelled) setOrderCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [loaded, user]);

  function handleLogout() {
    logout();
    window.location.replace("/dang-nhap");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-white/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-10 px-6 py-4">
        <Link href={routes.home} className="flex items-center gap-2">
          <Image
            src={logoSrc}
            alt={tenCuaHang}
            width={48}
            height={48}
            unoptimized
            className="size-12 object-contain"
            priority
          />
          <span className="font-serif text-2xl italic leading-none">{tenCuaHang}</span>
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

        <div className="hidden md:block">
          <SearchBox />
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/gio-hang"
            aria-label="Giỏ hàng"
            className="relative text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
          >
            <ShoppingCart className="size-5" />
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
                title={`Đơn hàng của tôi${orderCount > 0 ? ` — ${orderCount} đơn đang xử lý` : ""}`}
                className="relative text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
              >
                <Package className="size-5" />
                {orderCount > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex size-4 items-center justify-center rounded-full bg-[color:var(--color-ink)] px-1 text-[10px] text-white">
                    {orderCount > 99 ? "99+" : orderCount}
                  </span>
                )}
              </Link>
              <Link
                href="/tai-khoan"
                aria-label="Tài khoản"
                title={`${user.hoTen} — Quản lý tài khoản`}
                className="flex size-8 items-center justify-center rounded-full bg-[color:var(--color-pastel-blush)] text-xs font-medium text-[color:var(--color-ink)] transition hover:opacity-80"
              >
                {getInitials(user.hoTen)}
              </Link>
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

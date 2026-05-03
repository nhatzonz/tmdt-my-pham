"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchBox } from "@/components/layout/SearchBox";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { SystemConfig } from "@/features/cau-hinh/api";
import { imageUrl } from "@/features/ma-loi/api";
import type { ThietBi } from "@/features/thiet-bi/api";

const STATIC_NAV = [
  { label: "Tra cứu", href: "/tra-cuu" },
  { label: "Thiết bị", href: "/thiet-bi" },
];

export function Header({
  thietBis = [],
  systemConfig,
}: {
  thietBis?: ThietBi[];
  systemConfig?: SystemConfig | null;
}) {
  const { user, loaded, logout } = useAuth();
  const topThietBis = thietBis.slice(0, 3);
  const tenHeThong = systemConfig?.tenHeThong || "Tra Cứu Mã Lỗi";
  const logoSrc = (systemConfig?.logoUrl && imageUrl(systemConfig.logoUrl)) || "/logo.png";

  function handleLogout() {
    logout();
    window.location.replace("/dang-nhap");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-white/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-10 md:px-6 md:py-4">
        <MobileMenu thietBis={topThietBis} />

        <Link href={routes.home} className="flex items-center gap-2">
          <Image
            src={logoSrc}
            alt={tenHeThong}
            width={48}
            height={48}
            unoptimized
            className="size-9 object-contain md:size-12"
            priority
          />
          <span className="hidden font-serif text-2xl italic leading-none sm:inline">
            {tenHeThong}
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-7 text-sm md:flex">
          {STATIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
          {topThietBis.map((t) => (
            <Link
              key={t.id}
              href={`/tra-cuu?thietBiId=${t.id}`}
              className="text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
            >
              {t.tenThietBi}
            </Link>
          ))}
        </nav>

        <div className="flex-1 md:hidden" />

        <div className="hidden md:block">
          <SearchBox />
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {!loaded ? (
            <div className="size-5" aria-hidden />
          ) : user ? (
            <>
              {user.vaiTro === "ADMIN" && (
                <Link
                  href="/quan-tri"
                  aria-label="Trang quản trị"
                  title="Trang quản trị"
                  className="hidden text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)] md:inline-block"
                >
                  <Settings className="size-5" />
                </Link>
              )}
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
                className="hidden text-[color:var(--color-muted)] transition hover:text-[color:var(--color-ink)] md:inline-block"
              >
                <LogOut className="size-5" />
              </button>
            </>
          ) : (
            <Link
              href="/dang-nhap"
              aria-label="Đăng nhập"
              className="text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            >
              <User className="size-5" />
            </Link>
          )}
        </div>
      </div>

      <div className="border-t border-[color:var(--color-border)] px-4 pb-3 pt-2 md:hidden">
        <SearchBox />
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

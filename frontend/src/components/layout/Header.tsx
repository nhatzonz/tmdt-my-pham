"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Search, User } from "lucide-react";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/hooks/use-auth";

const NAV = [
  { label: "Shop All", href: "/" },
 
];

export function Header() {
  const { user, loaded, logout } = useAuth();

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
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[color:var(--color-ink-soft)] transition hover:text-[color:var(--color-ink)]"
            >
              {item.label}
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
          {!loaded ? (
            <div className="size-5" aria-hidden />
          ) : user ? (
            <>
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

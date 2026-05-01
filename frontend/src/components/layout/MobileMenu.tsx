"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, Menu, Package, User, X } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { Category } from "@/features/danh-muc/api";

/**
 * Drawer hamburger cho mobile (<md). Trên md+ component này tự ẩn.
 * Mở drawer lock body scroll, click ngoài / nút X / chọn link đều đóng.
 */
export function MobileMenu({ categories = [] }: { categories?: Category[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loaded, logout } = useAuth();

  // Đợi mount xong mới portal — tránh hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll khi drawer mở
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Đóng khi resize qua breakpoint md
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
    window.location.replace("/dang-nhap");
  }

  const drawer = open && (
    <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col gap-4 overflow-y-auto bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg italic">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="text-[color:var(--color-ink-soft)]"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col">
              <Link
                href="/san-pham"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-sm hover:bg-black/5"
              >
                Tất cả sản phẩm
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/san-pham?danhMucId=${c.id}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-3 text-sm hover:bg-black/5"
                >
                  {c.tenDanhMuc}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-black/5 pt-4">
              {!loaded ? (
                <div className="h-10" />
              ) : user ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/tai-khoan"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 text-sm hover:bg-black/5"
                  >
                    <User className="size-4" /> {user.hoTen}
                  </Link>
                  <Link
                    href="/don-hang"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 text-sm hover:bg-black/5"
                  >
                    <Package className="size-4" /> Đơn hàng của tôi
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg px-2 py-3 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="size-4" /> Đăng xuất
                  </button>
                </div>
              ) : (
                <Link
                  href="/dang-nhap"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-2 py-3 text-sm hover:bg-black/5"
                >
                  <User className="size-4" /> Đăng nhập
                </Link>
              )}
            </div>
          </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Mở menu"
        onClick={() => setOpen(true)}
        className="md:hidden text-[color:var(--color-ink)]"
      >
        <Menu className="size-6" />
      </button>
      {/* Portal ra body — tránh containing block của <header> với backdrop-filter
          nuốt position:fixed của drawer (chrome bug spec — backdrop-filter tạo
          containing block mới cho fixed/absolute con). */}
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}

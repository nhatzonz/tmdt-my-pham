"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, Menu, Settings, User, X } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { ThietBi } from "@/features/thiet-bi/api";

export function MobileMenu({ thietBis = [] }: { thietBis?: ThietBi[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loaded, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

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
      <button
        type="button"
        aria-label="Đóng menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/40"
      />
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
            href="/tra-cuu"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-3 text-sm hover:bg-black/5"
          >
            Tra cứu mã lỗi
          </Link>
          <Link
            href="/thiet-bi"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-3 text-sm hover:bg-black/5"
          >
            Thiết bị
          </Link>
          {thietBis.map((t) => (
            <Link
              key={t.id}
              href={`/tra-cuu?thietBiId=${t.id}`}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-sm hover:bg-black/5"
            >
              {t.tenThietBi}
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
              {user.vaiTro === "ADMIN" && (
                <Link
                  href="/quan-tri"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-2 py-3 text-sm hover:bg-black/5"
                >
                  <Settings className="size-4" /> Trang quản trị
                </Link>
              )}
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
              <User className="size-4" /> Đăng nhập admin
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
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}

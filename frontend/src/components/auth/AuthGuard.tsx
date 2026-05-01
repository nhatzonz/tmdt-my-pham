"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loaded } = useAuth();

  useEffect(() => {
    if (loaded && !user) {
      router.replace("/dang-nhap");
    }
  }, [loaded, user, router]);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--color-ivory)] text-sm text-[color:var(--color-muted)]">
        Đang kiểm tra phiên...
      </div>
    );
  }
  if (!user) return null;

  return <>{children}</>;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/features/auth/api";
import { AuthTabs } from "@/features/auth/components/AuthTabs";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { useToast } from "@/lib/toast";

export default function DangNhapPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("thuha@email.com");
  const [matKhau, setMatKhau] = useState("thuha12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.login({ email, matKhau });
      login(result.token, result.user);
      toast.success("Đăng nhập thành công", `Chào mừng ${result.user.hoTen}`);

      let target: string;
      if (result.user.vaiTro === "ADMIN") {
        target = "/quan-tri";
      } else {
        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      }
      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <AuthTabs active="dang-nhap" />

      <div>
        <h1 className="font-serif text-4xl">Chào mừng trở lại</h1>
        <p className="mt-3 text-sm text-[color:var(--color-muted)]">
          Đăng nhập để tiếp tục hành trình chăm da cùng Ngọc Lan Beauty.
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Input
          name="email"
          label="Email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="size-4" />}
          required
        />
        <Input
          name="mat_khau"
          type="password"
          label="Mật khẩu"
          placeholder="••••••••"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          leftIcon={<Lock className="size-4" />}
          required
        />

        <Checkbox name="remember" label="Ghi nhớ đăng nhập trong 30 ngày" defaultChecked />

        {error && (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
        )}

        <Button
          size="lg"
          className="w-full shadow-sm hover:shadow-md"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang đăng nhập
            </>
          ) : (
            <>
              Đăng nhập
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-[color:var(--color-muted)]">
        Chưa có tài khoản?{" "}
        <Link
          href="/dang-ky"
          className="font-medium text-[color:var(--color-ink)] underline underline-offset-4 hover:text-[color:var(--color-primary)]"
        >
          Đăng ký miễn phí
        </Link>
      </p>
    </div>
  );
}

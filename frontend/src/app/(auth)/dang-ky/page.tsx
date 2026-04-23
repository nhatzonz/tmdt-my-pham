"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/features/auth/api";
import { AuthTabs } from "@/features/auth/components/AuthTabs";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ApiError } from "@/lib/api-client";

export default function DangKyPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      setError("Bạn cần đồng ý với Điều khoản & Chính sách bảo mật.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.register({
        hoTen,
        email,
        matKhau,
        soDienThoai: soDienThoai || undefined,
      });
      login(result.token, result.user);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <AuthTabs active="dang-ky" />

      <div>
        <h1 className="font-serif text-4xl">Tạo tài khoản</h1>
        <p className="mt-3 text-sm text-[color:var(--color-muted)]">
          Nhận ngay —15% cho đơn đầu và mẫu thử miễn phí.
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <Input
          name="ho_ten"
          label="Họ và tên"
          value={hoTen}
          onChange={(e) => setHoTen(e.target.value)}
          leftIcon={<User className="size-4" />}
          required
          minLength={2}
        />
        <Input
          name="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="size-4" />}
          required
        />
        <Input
          name="so_dien_thoai"
          label="Số điện thoại"
          value={soDienThoai}
          onChange={(e) => setSoDienThoai(e.target.value)}
          leftIcon={<Phone className="size-4" />}
        />
        <Input
          name="mat_khau"
          type="password"
          label="Mật khẩu"
          placeholder="Ít nhất 8 ký tự"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          leftIcon={<Lock className="size-4" />}
          required
          minLength={8}
        />

        <Checkbox
          name="agree"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          label={
            <span className="text-xs text-[color:var(--color-muted)]">
              Tôi đồng ý với Điều khoản &amp; Chính sách bảo mật.
            </span>
          }
        />

        {error && (
          <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
        )}

        <Button size="lg" className="w-full" type="submit" disabled={loading}>
          {loading ? "Đang tạo..." : "Tạo tài khoản"}
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="underline underline-offset-4">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

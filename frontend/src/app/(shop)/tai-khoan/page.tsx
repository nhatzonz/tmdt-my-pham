"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { KeyRound, Save, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/features/auth/api";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { useToast } from "@/lib/toast";

export default function TaiKhoanPage() {
  const router = useRouter();
  const { user, loaded, updateUser } = useAuth();
  const toast = useToast();

  // Profile form
  const [hoTen, setHoTen] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [matKhauCu, setMatKhauCu] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [matKhauMoi2, setMatKhauMoi2] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (loaded && !user) router.replace("/dang-nhap?next=/tai-khoan");
  }, [loaded, user, router]);

  useEffect(() => {
    if (user) {
      setHoTen(user.hoTen ?? "");
      setSoDienThoai(user.soDienThoai ?? "");
    }
  }, [user]);

  if (!loaded || !user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center text-sm text-[color:var(--color-muted)]">
        Đang tải...
      </div>
    );
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await authApi.updateMe({
        hoTen: hoTen.trim(),
        soDienThoai: soDienThoai.trim() || undefined,
      });
      updateUser(updated);
      toast.success("Đã lưu thông tin cá nhân");
    } catch (e) {
      toast.error(
        "Không thể lưu",
        e instanceof ApiError ? e.message : "Lỗi không xác định",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (matKhauMoi !== matKhauMoi2) {
      toast.error("Mật khẩu chưa khớp", "Hai lần nhập mật khẩu mới phải giống nhau");
      return;
    }
    if (matKhauMoi.length < 6) {
      toast.error("Mật khẩu quá ngắn", "Mật khẩu mới phải ≥ 6 ký tự");
      return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword({ matKhauCu, matKhauMoi });
      setMatKhauCu("");
      setMatKhauMoi("");
      setMatKhauMoi2("");
      toast.success("Đã đổi mật khẩu", "Lần đăng nhập kế tiếp dùng mật khẩu mới");
    } catch (e) {
      toast.error(
        "Không thể đổi mật khẩu",
        e instanceof ApiError ? e.message : "Lỗi không xác định",
      );
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="mx-auto w-4/5 max-w-2xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Tài khoản của tôi</h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Quản lý thông tin cá nhân và mật khẩu.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[color:var(--color-pastel-cream)] px-4 py-2 text-xs text-[color:var(--color-ink-soft)]">
          <ShieldCheck className="size-4" />
          {user.vaiTro === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
          <form
            onSubmit={handleSaveProfile}
            className="flex flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]"
          >
            <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] pb-3">
              <UserIcon className="size-5 text-[color:var(--color-muted)]" />
              <h2 className="font-medium">Thông tin cá nhân</h2>
            </div>

            <Input
              name="email"
              label="Email"
              value={user.email}
              disabled
              hint="Email là định danh, không thể thay đổi."
            />

            <Input
              name="hoTen"
              label="Họ tên"
              value={hoTen}
              onChange={(e) => setHoTen(e.target.value)}
              required
              minLength={2}
              maxLength={100}
            />

            <Input
              name="soDienThoai"
              label="Số điện thoại"
              placeholder="0912345678 hoặc +84912345678"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              maxLength={20}
              hint="Có thể bỏ trống. Nếu nhập, phải đúng định dạng VN."
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                <Save className="size-4" />
                {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>

          <form
            onSubmit={handleChangePassword}
            className="flex flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]"
          >
            <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] pb-3">
              <KeyRound className="size-5 text-[color:var(--color-muted)]" />
              <h2 className="font-medium">Đổi mật khẩu</h2>
            </div>

            <Input
              name="matKhauCu"
              type="password"
              label="Mật khẩu hiện tại"
              value={matKhauCu}
              onChange={(e) => setMatKhauCu(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Input
              name="matKhauMoi"
              type="password"
              label="Mật khẩu mới (≥ 6 ký tự)"
              value={matKhauMoi}
              onChange={(e) => setMatKhauMoi(e.target.value)}
              required
              minLength={6}
              maxLength={100}
              autoComplete="new-password"
            />
            <Input
              name="matKhauMoi2"
              type="password"
              label="Nhập lại mật khẩu mới"
              value={matKhauMoi2}
              onChange={(e) => setMatKhauMoi2(e.target.value)}
              required
              minLength={6}
              maxLength={100}
              autoComplete="new-password"
            />

            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={savingPw}>
                {savingPw ? "Đang đổi..." : "Đổi mật khẩu"}
              </Button>
            </div>
          </form>
      </div>
    </div>
  );
}

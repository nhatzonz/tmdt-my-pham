"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FilterPill } from "@/components/ui/FilterPill";
import { Input } from "@/components/ui/Input";
import {
  type AdminUser,
  type UserAdminRequest,
  type UserRole,
  userAdminApi,
} from "@/features/nguoi-dung/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { useToast } from "@/lib/toast";

type Filter = "ALL" | "CUSTOMER" | "ADMIN";

type FormState = {
  hoTen: string;
  email: string;
  soDienThoai: string;
  vaiTro: UserRole;
  matKhau: string;
};

const INITIAL_FORM: FormState = {
  hoTen: "",
  email: "",
  soDienThoai: "",
  vaiTro: "CUSTOMER",
  matKhau: "",
};

export default function AdminNguoiDungPage() {
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [resetPwId, setResetPwId] = useState<number | null>(null);
  const [resetPwInput, setResetPwInput] = useState("");

  async function load() {
    try {
      setLoading(true);
      setUsers(await userAdminApi.list());
    } catch (e) {
      toast.error(
        "Lỗi tải người dùng",
        e instanceof ApiError ? e.message : "Lỗi không xác định",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      ALL: users.length,
      CUSTOMER: users.filter((u) => u.vaiTro === "CUSTOMER").length,
      ADMIN: users.filter((u) => u.vaiTro === "ADMIN").length,
    };
    return c;
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (filter !== "ALL" && u.vaiTro !== filter) return false;
      if (q && !u.email.toLowerCase().includes(q) && !u.hoTen.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [users, filter, search]);

  function startCreate() {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(u: AdminUser) {
    setEditingId(u.id);
    setForm({
      hoTen: u.hoTen,
      email: u.email,
      soDienThoai: u.soDienThoai ?? "",
      vaiTro: u.vaiTro,
      matKhau: "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelForm() {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: UserAdminRequest = {
        hoTen: form.hoTen.trim(),
        email: form.email.trim().toLowerCase(),
        soDienThoai: form.soDienThoai.trim() || undefined,
        vaiTro: form.vaiTro,
        matKhau: form.matKhau || undefined,
      };
      if (editingId == null && (!body.matKhau || body.matKhau.length < 6)) {
        toast.error("Mật khẩu quá ngắn", "Mật khẩu khi tạo mới phải ≥ 6 ký tự");
        setSubmitting(false);
        return;
      }
      if (editingId != null) {
        await userAdminApi.update(editingId, body);
        toast.success("Đã cập nhật người dùng", body.email);
      } else {
        await userAdminApi.create(body);
        toast.success("Đã tạo người dùng", body.email);
      }
      cancelForm();
      await load();
    } catch (e) {
      toast.error(
        "Không lưu được",
        e instanceof ApiError ? e.message : "Lỗi không xác định",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(u: AdminUser) {
    const msg =
      u.soDonHang > 0
        ? `Xoá ${u.email}? Tài khoản đã có ${u.soDonHang} đơn — sẽ ẩn (đơn cũ giữ nguyên).`
        : `Xoá hẳn ${u.email}?`;
    if (!confirm(msg)) return;
    try {
      await userAdminApi.delete(u.id);
      await load();
      toast.success("Đã xoá người dùng", u.email);
    } catch (e) {
      toast.error(
        "Không thể xoá",
        e instanceof ApiError ? e.message : "Lỗi không xác định",
      );
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (resetPwId == null) return;
    if (resetPwInput.length < 6) {
      toast.error("Mật khẩu quá ngắn", "Mật khẩu mới phải ≥ 6 ký tự");
      return;
    }
    try {
      await userAdminApi.resetPassword(resetPwId, { matKhauMoi: resetPwInput });
      setResetPwId(null);
      setResetPwInput("");
      toast.success("Đã đặt lại mật khẩu");
    } catch (e) {
      toast.error(
        "Không thể đặt lại mật khẩu",
        e instanceof ApiError ? e.message : "Lỗi không xác định",
      );
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Người dùng</h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Quản lý {users.length} tài khoản — tạo, sửa, đặt lại mật khẩu, xoá.
          </p>
        </div>
        <Button onClick={startCreate}>
          <UserPlus className="size-4" />
          Thêm người dùng
        </Button>
      </div>


      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)] sm:grid-cols-2"
        >
          <div className="sm:col-span-2 flex items-center justify-between">
            <h2 className="font-medium">
              {editingId != null ? `Sửa người dùng #${editingId}` : "Thêm người dùng mới"}
            </h2>
            <button
              type="button"
              onClick={cancelForm}
              className="text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
              aria-label="Đóng"
            >
              <X className="size-5" />
            </button>
          </div>

          <Input
            name="hoTen"
            label="Họ tên"
            value={form.hoTen}
            onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
            required
            minLength={2}
            maxLength={100}
          />
          <Input
            name="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            maxLength={100}
          />
          <Input
            name="soDienThoai"
            label="Số điện thoại"
            value={form.soDienThoai}
            onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
            maxLength={20}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
              Vai trò <span className="text-rose-600">*</span>
            </label>
            <select
              value={form.vaiTro}
              onChange={(e) => setForm({ ...form, vaiTro: e.target.value as UserRole })}
              className="cursor-pointer rounded-lg border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-ink)] focus:outline-none"
            >
              <option value="CUSTOMER">Khách hàng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>
          {editingId == null && (
            <Input
              name="matKhau"
              type="password"
              label="Mật khẩu (≥ 6 ký tự)"
              value={form.matKhau}
              onChange={(e) => setForm({ ...form, matKhau: e.target.value })}
              minLength={6}
              maxLength={100}
            />
          )}

          <div className="sm:col-span-2 flex justify-end gap-2 border-t border-[color:var(--color-border)] pt-4">
            <Button type="button" variant="outline" size="sm" onClick={cancelForm}>
              Huỷ
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Đang lưu..." : editingId != null ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Input
          name="search"
          placeholder="Tìm theo email hoặc tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          <FilterPill active={filter === "ALL"} onClick={() => setFilter("ALL")}>
            Tất cả ({counts.ALL})
          </FilterPill>
          <FilterPill active={filter === "CUSTOMER"} onClick={() => setFilter("CUSTOMER")}>
            Khách ({counts.CUSTOMER})
          </FilterPill>
          <FilterPill active={filter === "ADMIN"} onClick={() => setFilter("ADMIN")}>
            Admin ({counts.ADMIN})
          </FilterPill>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-[color:var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--color-ivory-2)] text-left text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Người dùng</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">SĐT</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3 text-right">Đơn</th>
              <th className="px-4 py-3">Tạo lúc</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-border)]">
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[color:var(--color-muted)]">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[color:var(--color-muted)]">
                  Không có người dùng phù hợp.
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} className="transition hover:bg-[color:var(--color-ivory-2)]/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-[color:var(--color-pastel-blush)] text-xs font-medium text-[color:var(--color-ink)]">
                      {initials(u.hoTen)}
                    </span>
                    <div>
                      <div className="font-medium">{u.hoTen}</div>
                      <div className="text-xs text-[color:var(--color-muted)]">#{u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 text-[color:var(--color-muted)]">
                  {u.soDienThoai ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.vaiTro} />
                </td>
                <td className="px-4 py-3 text-right font-medium">{u.soDonHang}</td>
                <td className="px-4 py-3 text-xs text-[color:var(--color-muted)]">
                  {formatDateTime(u.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      title="Sửa"
                      onClick={() => startEdit(u)}
                      className="rounded-md p-1.5 text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-ivory-2)] hover:text-[color:var(--color-ink)]"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Đặt lại mật khẩu"
                      onClick={() => {
                        setResetPwId(u.id);
                        setResetPwInput("");
                      }}
                      className="rounded-md p-1.5 text-[color:var(--color-muted)] transition hover:bg-[color:var(--color-ivory-2)] hover:text-[color:var(--color-ink)]"
                    >
                      <KeyRound className="size-4" />
                    </button>
                    <button
                      type="button"
                      title="Xoá"
                      onClick={() => handleDelete(u)}
                      className="rounded-md p-1.5 text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resetPwId != null && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-24 backdrop-blur-sm"
          onClick={() => setResetPwId(null)}
        >
          <form
            onSubmit={handleResetPassword}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl">Đặt lại mật khẩu</h2>
              <button
                type="button"
                onClick={() => setResetPwId(null)}
                aria-label="Đóng"
                className="text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-[color:var(--color-muted)]">
              Mật khẩu mới sẽ thay thế hoàn toàn — hãy thông báo cho người dùng.
            </p>
            <Input
              name="matKhauMoi"
              type="password"
              label="Mật khẩu mới (≥ 6 ký tự)"
              value={resetPwInput}
              onChange={(e) => setResetPwInput(e.target.value)}
              minLength={6}
              required
              className="mt-4"
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setResetPwId(null)}>
                Huỷ
              </Button>
              <Button type="submit" size="sm">
                Đặt lại
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "ADMIN") {
    return (
      <span className="inline-flex items-center rounded-full bg-[color:var(--color-ink)] px-2.5 py-1 text-xs font-medium text-white">
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[color:var(--color-pastel-cream)] px-2.5 py-1 text-xs text-[color:var(--color-ink-soft)]">
      Khách
    </span>
  );
}

function initials(hoTen: string): string {
  const parts = hoTen.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0][0]!.toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

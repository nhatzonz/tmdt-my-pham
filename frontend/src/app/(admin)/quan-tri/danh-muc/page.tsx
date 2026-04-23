"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categoryApi, type Category } from "@/features/danh-muc/api";
import { ApiError } from "@/lib/api-client";

export default function AdminDanhMucPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tenDanhMuc, setTenDanhMuc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadList() {
    try {
      setError(null);
      const data = await categoryApi.listAdmin();
      setCategories(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi không xác định");
    }
  }

  useEffect(() => {
    loadList();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await categoryApi.createAdmin({ tenDanhMuc });
      setTenDanhMuc("");
      await loadList();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">Danh mục</h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        Tạo danh mục và xem danh sách hiện có.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[400px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="flex h-fit flex-col gap-4 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]"
        >
          <h2 className="font-medium">Thêm danh mục</h2>
          <Input
            name="tenDanhMuc"
            label="Tên danh mục"
            value={tenDanhMuc}
            onChange={(e) => setTenDanhMuc(e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />
          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo danh mục"}
          </Button>
        </form>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Danh sách ({categories.length})</h2>
          </div>
          {categories.length === 0 ? (
            <p className="text-sm text-[color:var(--color-muted)]">Chưa có danh mục nào.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--color-border)] text-left text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Tên danh mục</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[color:var(--color-border)] last:border-0"
                  >
                    <td className="py-3 text-[color:var(--color-muted)]">#{c.id}</td>
                    <td className="py-3">{c.tenDanhMuc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

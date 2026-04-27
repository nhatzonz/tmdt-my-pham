import { env } from "@/config/env";
import { apiClient } from "@/lib/api-client";

export type LoaiDa = "OILY" | "DRY" | "COMBINATION" | "SENSITIVE" | "NORMAL" | "ALL";
export type TrangThai = "ACTIVE" | "HIDDEN";

export type Product = {
  id: number;
  maSanPham?: string;
  tenSanPham: string;
  gia: number;
  loaiDa: LoaiDa;
  danhMucId: number;
  moTa?: string;
  thuongHieu?: string;
  hinhAnh: string[];
  trangThai: TrangThai;
};

export type CreateProductRequest = {
  maSanPham?: string;
  tenSanPham: string;
  gia: number;
  loaiDa: LoaiDa;
  danhMucId: number;
  moTa?: string;
  thuongHieu?: string;
  hinhAnh?: string[];
};

export type UploadResult = {
  url: string;
  filename: string;
  size: number;
};

export type SortKey = "price_asc" | "price_desc";

export type ListParams = {
  danhMucId?: number[];
  loaiDa?: LoaiDa[];
  thuongHieu?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: SortKey;
};

export const productApi = {
  // Public
  list: (params?: ListParams) =>
    apiClient.get<Product[]>("/api/products", {
      query: params,
      cache: "no-store",
    }),
  getById: (id: number | string) =>
    apiClient.get<Product>(`/api/products/${id}`, { cache: "no-store" }),
  search: (q: string) =>
    apiClient.get<Product[]>("/api/products/search", {
      query: { q },
      cache: "no-store",
    }),

  // Admin
  listAdmin: () => apiClient.get<Product[]>("/api/admin/products"),
  createAdmin: (body: CreateProductRequest) =>
    apiClient.post<Product>("/api/admin/products", body),
  updateAdmin: (id: number, body: CreateProductRequest) =>
    apiClient.put<Product>(`/api/admin/products/${id}`, body),
  deleteAdmin: (id: number) =>
    apiClient.delete<null>(`/api/admin/products/${id}`),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<UploadResult>("/api/admin/upload", form);
  },
};

/** Build full URL cho ảnh server: `/uploads/abc.jpg` → `http://localhost:8080/uploads/abc.jpg`. */
export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.apiBaseUrl}${path}`;
}

// Helper: pastel background class từ id (deterministic)
const PASTELS = [
  "bg-[color:var(--color-pastel-beige)]",
  "bg-[color:var(--color-pastel-mint)]",
  "bg-[color:var(--color-pastel-blush)]",
  "bg-[color:var(--color-pastel-lavender)]",
  "bg-[color:var(--color-pastel-cream)]",
  "bg-[color:var(--color-pastel-blue)]",
];

export function pastelBg(id: number | string): string {
  const n = typeof id === "number" ? id : Number.parseInt(id, 10) || 0;
  return PASTELS[Math.abs(n) % PASTELS.length]!;
}

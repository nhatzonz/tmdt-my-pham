import { apiClient } from "@/lib/api-client";

export type LoaiDa = "OILY" | "DRY" | "COMBINATION" | "SENSITIVE" | "NORMAL" | "ALL";
export type TrangThai = "ACTIVE" | "HIDDEN";

export type Product = {
  id: number;
  tenSanPham: string;
  gia: number;
  loaiDa: LoaiDa;
  danhMucId: number;
  moTa?: string;
  thuongHieu?: string;
  trangThai: TrangThai;
};

export type CreateProductRequest = {
  tenSanPham: string;
  gia: number;
  loaiDa: LoaiDa;
  danhMucId: number;
  moTa?: string;
  thuongHieu?: string;
};

export type ListParams = {
  danhMucId?: number;
  loaiDa?: LoaiDa;
};

export const productApi = {
  // Public — plan §2.3 sequence 2.5.2
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

  // Admin — plan §2.3 sequence 2.5.6
  listAdmin: () => apiClient.get<Product[]>("/api/admin/products"),
  createAdmin: (body: CreateProductRequest) =>
    apiClient.post<Product>("/api/admin/products", body),
};

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

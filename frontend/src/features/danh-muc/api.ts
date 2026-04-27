import { apiClient } from "@/lib/api-client";

export type Category = {
  id: number;
  tenDanhMuc: string;
  hinhAnh?: string;
  thuTu: number;
  productCount: number;
};

export type CreateCategoryRequest = {
  tenDanhMuc: string;
  hinhAnh?: string;
  thuTu?: number;
};

export const categoryApi = {
  // Public
  list: () => apiClient.get<Category[]>("/api/categories", { cache: "no-store" }),

  // Admin
  listAdmin: () => apiClient.get<Category[]>("/api/admin/categories"),
  createAdmin: (body: CreateCategoryRequest) =>
    apiClient.post<Category>("/api/admin/categories", body),
  updateAdmin: (id: number, body: CreateCategoryRequest) =>
    apiClient.put<Category>(`/api/admin/categories/${id}`, body),
  deleteAdmin: (id: number) =>
    apiClient.delete<null>(`/api/admin/categories/${id}`),
};

import { apiClient } from "@/lib/api-client";

export type Category = {
  id: number;
  tenDanhMuc: string;
};

export type CreateCategoryRequest = {
  tenDanhMuc: string;
};

export const categoryApi = {
  // Public
  list: () => apiClient.get<Category[]>("/api/categories", { cache: "no-store" }),

  // Admin
  listAdmin: () => apiClient.get<Category[]>("/api/admin/categories"),
  createAdmin: (body: CreateCategoryRequest) =>
    apiClient.post<Category>("/api/admin/categories", body),
};

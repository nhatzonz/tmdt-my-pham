import { apiClient } from "@/lib/api-client";

export type UserRole = "CUSTOMER" | "ADMIN";

export type AdminUser = {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  vaiTro: UserRole;
  soDonHang: number;
  createdAt: string;
};

export type UserAdminRequest = {
  hoTen: string;
  email: string;
  soDienThoai?: string;
  vaiTro: UserRole;
  matKhau?: string;  // bắt buộc khi tạo, optional khi update
};

export type PasswordResetRequest = {
  matKhauMoi: string;
};

export const userAdminApi = {
  list: () =>
    apiClient.get<AdminUser[]>("/api/admin/users", { cache: "no-store" }),

  getById: (id: number | string) =>
    apiClient.get<AdminUser>(`/api/admin/users/${id}`, { cache: "no-store" }),

  create: (body: UserAdminRequest) =>
    apiClient.post<AdminUser>("/api/admin/users", body),

  update: (id: number | string, body: UserAdminRequest) =>
    apiClient.put<AdminUser>(`/api/admin/users/${id}`, body),

  resetPassword: (id: number | string, body: PasswordResetRequest) =>
    apiClient.put<null>(`/api/admin/users/${id}/password`, body),

  delete: (id: number | string) =>
    apiClient.delete<null>(`/api/admin/users/${id}`),
};

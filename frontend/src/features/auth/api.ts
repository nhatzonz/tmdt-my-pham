import { apiClient } from "@/lib/api-client";
import type { StoredUser } from "@/lib/auth-storage";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";

export type UpdateMeRequest = {
  hoTen: string;
  soDienThoai?: string;
};

export type ChangePasswordRequest = {
  matKhauCu: string;
  matKhauMoi: string;
};

export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<AuthResponse>("/api/auth/login", body, { auth: false }),

  register: (body: RegisterRequest) =>
    apiClient.post<AuthResponse>("/api/auth/register", body, { auth: false }),

  me: () => apiClient.get<StoredUser>("/api/auth/me"),

  updateMe: (body: UpdateMeRequest) =>
    apiClient.put<StoredUser>("/api/auth/me", body),

  changePassword: (body: ChangePasswordRequest) =>
    apiClient.put<null>("/api/auth/me/password", body),
};

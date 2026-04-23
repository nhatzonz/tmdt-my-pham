import { apiClient } from "@/lib/api-client";
import type { StoredUser } from "@/lib/auth-storage";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";

export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<AuthResponse>("/api/auth/login", body, { auth: false }),

  register: (body: RegisterRequest) =>
    apiClient.post<AuthResponse>("/api/auth/register", body, { auth: false }),

  me: () => apiClient.get<StoredUser>("/api/auth/me"),
};

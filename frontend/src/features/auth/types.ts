import type { StoredUser } from "@/lib/auth-storage";

export type LoginRequest = {
  email: string;
  matKhau: string;
};

export type RegisterRequest = {
  hoTen: string;
  email: string;
  matKhau: string;
  soDienThoai?: string;
};

export type AuthResponse = {
  token: string;
  user: StoredUser;
};

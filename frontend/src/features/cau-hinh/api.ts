import { apiClient } from "@/lib/api-client";

export type SystemConfig = {
  tenHeThong: string;
  logoUrl?: string;
  moTa?: string;
  soDienThoai?: string;
  emailLienHe?: string;
  diaChi?: string;
  linkFacebook?: string;
  linkYoutube?: string;
};

export type SystemConfigRequest = SystemConfig;

export const systemConfigApi = {
  get: () =>
    apiClient.get<SystemConfig>("/api/cau-hinh", { auth: false, cache: "no-store" }),

  update: (body: SystemConfigRequest) =>
    apiClient.put<SystemConfig>("/api/admin/cau-hinh", body),
};

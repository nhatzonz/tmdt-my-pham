import { apiClient } from "@/lib/api-client";

export type StoreConfig = {
  tenCuaHang: string;
  logoUrl?: string;
  diaChiTinh?: string;
  diaChiQuan?: string;
  diaChiPhuong?: string;
  diaChiChiTiet?: string;
  diaChiDayDu: string;
  soDienThoai?: string;
  emailLienHe?: string;
  linkFacebook?: string;
  linkInstagram?: string;
  linkTiktok?: string;
  linkYoutube?: string;
  updatedAt?: string;
};

export type StoreConfigRequest = {
  tenCuaHang: string;
  logoUrl?: string;
  diaChiTinh?: string;
  diaChiQuan?: string;
  diaChiPhuong?: string;
  diaChiChiTiet?: string;
  soDienThoai?: string;
  emailLienHe?: string;
  linkFacebook?: string;
  linkInstagram?: string;
  linkTiktok?: string;
  linkYoutube?: string;
};

export const storeConfigApi = {
  get: () =>
    apiClient.get<StoreConfig>("/api/cau-hinh", { auth: false, cache: "no-store" }),

  update: (body: StoreConfigRequest) =>
    apiClient.put<StoreConfig>("/api/admin/cau-hinh", body),
};

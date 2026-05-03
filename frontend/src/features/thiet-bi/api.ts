import { apiClient } from "@/lib/api-client";

export type ThietBi = {
  id: number;
  tenThietBi: string;
  hang?: string;
  hinhAnh?: string;
  moTa?: string;
  thuTu: number;
  soMaLoi: number;
};

export type CreateThietBiRequest = {
  tenThietBi: string;
  hang?: string;
  hinhAnh?: string;
  moTa?: string;
  thuTu?: number;
};

export const thietBiApi = {
  list: () => apiClient.get<ThietBi[]>("/api/thiet-bi", { cache: "no-store", auth: false }),
  getById: (id: number | string) =>
    apiClient.get<ThietBi>(`/api/thiet-bi/${id}`, { cache: "no-store", auth: false }),

  listAdmin: () => apiClient.get<ThietBi[]>("/api/admin/thiet-bi"),
  createAdmin: (body: CreateThietBiRequest) =>
    apiClient.post<ThietBi>("/api/admin/thiet-bi", body),
  updateAdmin: (id: number, body: CreateThietBiRequest) =>
    apiClient.put<ThietBi>(`/api/admin/thiet-bi/${id}`, body),
  deleteAdmin: (id: number) => apiClient.delete<null>(`/api/admin/thiet-bi/${id}`),
};

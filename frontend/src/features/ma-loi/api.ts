import { env } from "@/config/env";
import { apiClient } from "@/lib/api-client";

export type MucDo = "NHE" | "TRUNG_BINH" | "NGHIEM_TRONG";
export type TrangThai = "ACTIVE" | "HIDDEN";

export type MaLoi = {
  id: number;
  maLoi: string;
  tenLoi: string;
  thietBiId: number;
  tenThietBi?: string;
  hangThietBi?: string;
  moTa?: string;
  nguyenNhan?: string;
  cachKhacPhuc?: string;
  mucDo: MucDo;
  trangThai: TrangThai;
  luotXem: number;
  hinhAnh: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateMaLoiRequest = {
  maLoi: string;
  tenLoi: string;
  thietBiId: number;
  moTa?: string;
  nguyenNhan?: string;
  cachKhacPhuc?: string;
  mucDo: MucDo;
  hinhAnh?: string[];
};

export type UploadResult = {
  url: string;
  filename: string;
  size: number;
};

export type SortKey = "luot_xem_desc" | "ma_loi_asc";

export type ListParams = {
  thietBiId?: number[];
  mucDo?: MucDo[];
  sort?: SortKey;
};

export const MUC_DO_LABEL: Record<MucDo, string> = {
  NHE: "Nhẹ",
  TRUNG_BINH: "Trung bình",
  NGHIEM_TRONG: "Nghiêm trọng",
};

export const MUC_DO_BADGE: Record<MucDo, string> = {
  NHE: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  TRUNG_BINH: "bg-amber-100 text-amber-700 ring-amber-200",
  NGHIEM_TRONG: "bg-rose-100 text-rose-700 ring-rose-200",
};

export const maLoiApi = {
  list: (params?: ListParams) =>
    apiClient.get<MaLoi[]>("/api/ma-loi", {
      query: params,
      cache: "no-store",
      auth: false,
    }),
  getById: (id: number | string) =>
    apiClient.get<MaLoi>(`/api/ma-loi/${id}`, { cache: "no-store", auth: false }),
  search: (q: string) =>
    apiClient.get<MaLoi[]>("/api/ma-loi/search", {
      query: { q },
      cache: "no-store",
      auth: false,
    }),

  listAdmin: () => apiClient.get<MaLoi[]>("/api/admin/ma-loi"),
  createAdmin: (body: CreateMaLoiRequest) =>
    apiClient.post<MaLoi>("/api/admin/ma-loi", body),
  updateAdmin: (id: number, body: CreateMaLoiRequest) =>
    apiClient.put<MaLoi>(`/api/admin/ma-loi/${id}`, body),
  deleteAdmin: (id: number) => apiClient.delete<null>(`/api/admin/ma-loi/${id}`),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<UploadResult>("/api/admin/upload", form);
  },
};

export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${env.apiBaseUrl}${path}`;
}

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

import { apiClient } from "@/lib/api-client";

export type InventoryAction = "IMPORT" | "EXPORT" | "SET";

export type InventoryRow = {
  sanPhamId: number;
  maSanPham?: string;
  tenSanPham: string;
  thuongHieu?: string;
  hinhAnh?: string;
  soLuongTon: number;
  nguongCanhBao: number;
  canhBao: boolean;
  hetHang: boolean;
};

export type InventoryUpdateRequest = {
  sanPhamId: number;
  action: InventoryAction;
  soLuong: number;
};

export type InventoryThresholdRequest = {
  sanPhamId: number;
  nguongCanhBao: number;
};

export type InventoryLogAction = "IMPORT" | "EXPORT" | "SET" | "ORDER";

export type InventoryHistoryRow = {
  id: number;
  sanPhamId: number;
  maSanPham?: string;
  tenSanPham: string;
  nguoiDungId?: number;
  nguoiDungHoTen?: string;
  action: InventoryLogAction;
  soLuong: number;
  tonTruoc: number;
  tonSau: number;
  delta: number;
  nguon?: string;
  ghiChu?: string;
  createdAt: string;
};

export const inventoryApi = {
  listAdmin: () =>
    apiClient.get<InventoryRow[]>("/api/admin/inventory", { cache: "no-store" }),
  update: (body: InventoryUpdateRequest) =>
    apiClient.post<InventoryRow>("/api/admin/inventory/update", body),
  updateThreshold: (body: InventoryThresholdRequest) =>
    apiClient.post<InventoryRow>("/api/admin/inventory/threshold", body),
  listHistory: (sanPhamId?: number) =>
    apiClient.get<InventoryHistoryRow[]>("/api/admin/inventory/history", {
      query: sanPhamId !== undefined ? { sanPhamId } : undefined,
      cache: "no-store",
    }),
};

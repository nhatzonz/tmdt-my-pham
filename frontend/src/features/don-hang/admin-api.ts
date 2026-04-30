import { apiClient } from "@/lib/api-client";
import type { OrderLine, OrderStatus } from "./api";

export type AdminOrder = {
  id: number;
  nguoiDungId: number;
  khachHoTen: string;
  khachEmail?: string;
  khachSoDienThoai?: string;
  tongTien: number;
  trangThai: OrderStatus;
  diaChiGiao: string;
  phuongThucTt: string;
  maCoupon?: string;
  phanTramGiam?: number;
  createdAt: string;
  items: OrderLine[];
  soLuongMon: number;
};

export type OrderStats = Record<OrderStatus, number>;

export const adminOrderApi = {
  list: (status?: OrderStatus) =>
    apiClient.get<AdminOrder[]>("/api/admin/orders", {
      query: status ? { status } : undefined,
      cache: "no-store",
    }),

  stats: () =>
    apiClient.get<OrderStats>("/api/admin/orders/stats", { cache: "no-store" }),

  getById: (id: number | string) =>
    apiClient.get<AdminOrder>(`/api/admin/orders/${id}`, { cache: "no-store" }),

  updateStatus: (id: number | string, trangThai: OrderStatus) =>
    apiClient.put<AdminOrder>(`/api/admin/orders/${id}/status`, { trangThai }),
};

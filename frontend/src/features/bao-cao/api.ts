import { apiClient } from "@/lib/api-client";
import type { OrderStatus } from "@/features/don-hang/api";

export type Overview = {
  doanhThu30Ngay: number;
  doanhThuHomNay: number;
  donCompleted30Ngay: number;
  donPending: number;
  donShipping: number;
  donCancelled30Ngay: number;
  spHetHang: number;
  spCanhBao: number;
  tongSanPham: number;
  tongDanhMuc: number;
  tongUser: number;
  tongCouponHoatDong: number;
};

export type RevenueDay = {
  ngay: string;
  tongTien: number;
  soDon: number;
};

export type TopProduct = {
  sanPhamId: number;
  tenSanPham: string;
  maSanPham?: string;
  hinhAnh?: string;
  soLuongDaBan: number;
  doanhThu: number;
};

export type OrderStatusBreakdown = Record<OrderStatus, number>;

export const reportApi = {
  overview: () =>
    apiClient.get<Overview>("/api/admin/reports/overview", { cache: "no-store" }),
  revenue: (days = 30) =>
    apiClient.get<RevenueDay[]>("/api/admin/reports/revenue", {
      query: { days },
      cache: "no-store",
    }),
  topProducts: (limit = 10) =>
    apiClient.get<TopProduct[]>("/api/admin/reports/top-products", {
      query: { limit },
      cache: "no-store",
    }),
  orderStatus: () =>
    apiClient.get<OrderStatusBreakdown>("/api/admin/reports/order-status", {
      cache: "no-store",
    }),
};

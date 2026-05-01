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
  ngay: string; // 'YYYY-MM-DD'
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

export type CTRDay = {
  ngay: string;
  impressions: number;
  clicks: number;
  ctr: number; // 0..1
};

export type CTROverview = {
  days: number;
  impressions: number;
  clicks: number;
  ctr: number;
};

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
  aiCtrOverview: (days = 30) =>
    apiClient.get<CTROverview>("/api/admin/reports/ai-ctr", {
      query: { days },
      cache: "no-store",
    }),
  aiCtrByDay: (days = 30) =>
    apiClient.get<CTRDay[]>("/api/admin/reports/ai-ctr-by-day", {
      query: { days },
      cache: "no-store",
    }),
};

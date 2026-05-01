import { apiClient } from "@/lib/api-client";

export type CouponStatus = "ACTIVE" | "INACTIVE";

export type Coupon = {
  id: number;
  maCode: string;
  phanTramGiam: number;
  startAt: string;
  endAt: string;
  status: CouponStatus;
  soLuong?: number | null;
  daSuDung: number;
  conLai?: number | null;
  isLive: boolean;
};

export type CouponRequest = {
  maCode: string;
  phanTramGiam: number;
  startAt: string;  // ISO
  endAt: string;
  status?: CouponStatus;
  soLuong?: number | null;
};

export const couponApi = {
  listPublic: () =>
    apiClient.get<Coupon[]>("/api/coupons", { auth: false, cache: "no-store" }),
  listAdmin: () => apiClient.get<Coupon[]>("/api/admin/coupons", { cache: "no-store" }),
  createAdmin: (body: CouponRequest) => apiClient.post<Coupon>("/api/admin/coupons", body),
  updateAdmin: (id: number, body: CouponRequest) =>
    apiClient.put<Coupon>(`/api/admin/coupons/${id}`, body),
  deleteAdmin: (id: number) =>
    apiClient.delete<null>(`/api/admin/coupons/${id}`),
};

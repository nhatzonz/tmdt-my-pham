import { apiClient } from "@/lib/api-client";

export type OrderStatus = "PENDING" | "SHIPPING" | "COMPLETED" | "CANCELLED";

export type OrderLine = {
  id: number;
  sanPhamId: number;
  tenSanPham: string;
  hinhAnh?: string;
  soLuong: number;
  giaBan: number;
  lineTotal: number;
};

export type Order = {
  id: number;
  nguoiDungId: number;
  tongTien: number;
  trangThai: OrderStatus;
  diaChiGiao: string;
  phuongThucTt: string;
  maCoupon?: string;
  phanTramGiam?: number;
  createdAt: string;
  items: OrderLine[];
};

export type CartLineRequest = {
  sanPhamId: number;
  soLuong: number;
};

export type CheckoutRequest = {
  items: CartLineRequest[];
  diaChiGiao: string;
  maCoupon?: string;
  phuongThucTt?: string;
};

export type CartCheckResponse = {
  ok: boolean;
  tonKhoCon: number;
  error?: string;
};

export const orderApi = {
  checkStock: (body: CartLineRequest) =>
    apiClient.post<CartCheckResponse>("/api/cart/add", body, { auth: false }),

  checkout: (body: CheckoutRequest) =>
    apiClient.post<Order>("/api/orders/checkout", body),

  mine: () => apiClient.get<Order[]>("/api/orders/me", { cache: "no-store" }),

  getById: (id: number | string) =>
    apiClient.get<Order>(`/api/orders/${id}`, { cache: "no-store" }),

  cancel: (id: number | string) =>
    apiClient.post<Order>(`/api/orders/${id}/cancel`),
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xử lý",
  SHIPPING: "Đang giao",
  COMPLETED: "Đã hoàn tất",
  CANCELLED: "Đã huỷ",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "SHIPPING",
  "COMPLETED",
];

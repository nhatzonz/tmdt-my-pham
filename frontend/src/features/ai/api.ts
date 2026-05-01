import { apiClient } from "@/lib/api-client";
import type { Product } from "@/features/san-pham/api";

export type AINguon = "CHAT" | "HOMEPAGE" | "PRODUCT_DETAIL";

export type AIRecommendItem = {
  sanPhamId: number;
  tenSanPham: string;
  gia: number;
  loaiDa?: string | null;
  thuongHieu?: string | null;
  hinhAnh?: string | null;
  danhMuc?: string | null;
  score: number;
};

export type AIRecommendResponse = {
  items: AIRecommendItem[];
  strategy: "PERSONALIZED" | "POPULAR" | "SIMILAR";
};

export type AIChatResponse = {
  sessionId: number;
  reply: string;
  sanPhamIds: number[];
  products: AIRecommendItem[];
};

export const aiApi = {
  chat: (message: string, sessionId?: number | null) =>
    apiClient.post<AIChatResponse>(
      "/api/ai/chat",
      { message, sessionId: sessionId ?? null },
      { auth: true },
    ),

  recommendForUser: (userId: number, limit = 6) =>
    apiClient.get<AIRecommendResponse>(`/api/recommendations/${userId}`, {
      query: { limit },
      cache: "no-store",
    }),

  similar: (productId: number, limit = 4) =>
    apiClient.get<AIRecommendResponse>(`/api/products/${productId}/similar`, {
      query: { limit },
      auth: false,
      cache: "no-store",
    }),

  trackClick: (sanPhamId: number, nguon: AINguon) =>
    apiClient.post<null>("/api/ai/click", { sanPhamId, nguon }, { auth: true }),
};

export function aiItemToProduct(item: AIRecommendItem): Product {
  return {
    id: item.sanPhamId,
    tenSanPham: item.tenSanPham,
    gia: item.gia,
    loaiDa: (item.loaiDa as Product["loaiDa"]) ?? "ALL",
    danhMucId: 0,
    moTa: undefined,
    thuongHieu: item.thuongHieu ?? undefined,
    hinhAnh: item.hinhAnh ? [item.hinhAnh] : [],
    trangThai: "ACTIVE",
    soLuongTon: 1,
    hetHang: false,
  };
}

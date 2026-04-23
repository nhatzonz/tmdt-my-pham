export const routes = {
  home: "/",
  sanPham: {
    list: "/san-pham",
    detail: (id: number | string) => `/san-pham/${id}`,
  },
  auth: {
    dangNhap: "/dang-nhap",
    dangKy: "/dang-ky",
  },
  quanTri: {
    dashboard: "/quan-tri",
    danhMuc: "/quan-tri/danh-muc",
    sanPham: "/quan-tri/san-pham",
  },
} as const;

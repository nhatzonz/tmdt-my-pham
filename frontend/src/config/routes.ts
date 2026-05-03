export const routes = {
  home: "/",
  traCuu: {
    list: "/tra-cuu",
    detail: (id: number | string) => `/tra-cuu/${id}`,
  },
  thietBi: {
    list: "/thiet-bi",
  },
  auth: {
    dangNhap: "/dang-nhap",
    dangKy: "/dang-ky",
  },
  quanTri: {
    dashboard: "/quan-tri",
    thietBi: "/quan-tri/thiet-bi",
    maLoi: "/quan-tri/ma-loi",
    nguoiDung: "/quan-tri/nguoi-dung",
    cauHinh: "/quan-tri/cau-hinh",
  },
} as const;

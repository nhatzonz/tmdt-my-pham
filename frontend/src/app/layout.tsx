import type { Metadata } from "next";
import { DM_Serif_Display, Geist } from "next/font/google";
import { systemConfigApi } from "@/features/cau-hinh/api";
import { ToastProvider } from "@/lib/toast";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let tenHeThong = "Tra Cứu Mã Lỗi";
  try {
    const cfg = await systemConfigApi.get();
    if (cfg?.tenHeThong) tenHeThong = cfg.tenHeThong;
  } catch {}
  return {
    title: `${tenHeThong} — Tra cứu mã lỗi thiết bị điện tử`,
    description:
      "Hệ thống tra cứu nhanh mã lỗi của tủ lạnh, máy giặt, điều hoà, tivi và nhiều thiết bị khác — kèm hình ảnh và cách khắc phục.",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${dmSerif.variable} ${geist.variable}`}>
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

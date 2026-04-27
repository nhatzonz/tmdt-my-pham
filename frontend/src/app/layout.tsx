import type { Metadata } from "next";
import { DM_Serif_Display, Geist } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Ngọc Lan Beauty — Mỹ phẩm & nhân hoá theo làn da Á Đông",
  description:
    "Routine làm đẹp dành riêng cho làn da của bạn. Quiz 90 giây, gợi ý AI cá nhân hoá.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${dmSerif.variable} ${geist.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

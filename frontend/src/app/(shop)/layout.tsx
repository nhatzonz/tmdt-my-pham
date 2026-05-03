import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { systemConfigApi, type SystemConfig } from "@/features/cau-hinh/api";
import { thietBiApi, type ThietBi } from "@/features/thiet-bi/api";

export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let thietBis: ThietBi[] = [];
  let systemConfig: SystemConfig | null = null;
  try {
    thietBis = await thietBiApi.list();
  } catch {
    thietBis = [];
  }
  try {
    systemConfig = await systemConfigApi.get();
  } catch {
    systemConfig = null;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[color:var(--color-ivory)]">
      <TopBar />
      <Header thietBis={thietBis} systemConfig={systemConfig} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

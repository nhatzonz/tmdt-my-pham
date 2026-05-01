import { AuthGuard } from "@/components/auth/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";
import { storeConfigApi, type StoreConfig } from "@/features/cau-hinh/api";
import { categoryApi } from "@/features/danh-muc/api";

export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: Awaited<ReturnType<typeof categoryApi.list>> = [];
  let storeConfig: StoreConfig | null = null;
  try {
    categories = await categoryApi.list();
  } catch {
    categories = [];
  }
  try {
    storeConfig = await storeConfigApi.get();
  } catch {
    storeConfig = null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-ivory)]">
      <TopBar />
      <Header categories={categories} storeConfig={storeConfig} />
      <main className="flex-1">
        <AuthGuard>{children}</AuthGuard>
      </main>
      <Footer />
    </div>
  );
}

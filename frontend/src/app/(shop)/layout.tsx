import { AuthGuard } from "@/components/auth/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TopBar } from "@/components/layout/TopBar";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--color-ivory)]">
      <TopBar />
      <Header />
      <main className="flex-1">
        <AuthGuard>{children}</AuthGuard>
      </main>
      <Footer />
    </div>
  );
}

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { thietBiApi } from "@/features/thiet-bi/api";
import { ThietBiCard } from "@/features/thiet-bi/components/ThietBiCard";

export const dynamic = "force-dynamic";

export default async function ThietBiPage() {
  const thietBis = await thietBiApi.list().catch(() => []);

  return (
    <div className="mx-auto w-full px-4 py-6 md:w-4/5 md:px-6 md:py-10">
      <Breadcrumb
        items={[{ label: "Trang chủ", href: "/" }, { label: "Thiết bị" }]}
      />
      <h1 className="mt-6 font-serif text-2xl sm:text-3xl md:text-5xl">
        Danh sách thiết bị
      </h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        {thietBis.length} thiết bị · Chọn thiết bị để xem các mã lỗi liên quan
      </p>

      {thietBis.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[color:var(--color-border)] bg-white/50 p-12 text-center">
          <p className="text-sm text-[color:var(--color-muted)]">
            Chưa có thiết bị nào.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {thietBis.map((t) => (
            <ThietBiCard key={t.id} thietBi={t} />
          ))}
        </div>
      )}
    </div>
  );
}

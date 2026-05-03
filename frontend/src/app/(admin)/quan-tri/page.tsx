"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowUpRight, Cpu, Eye, Settings, Users } from "lucide-react";
import { maLoiApi, MUC_DO_BADGE, MUC_DO_LABEL, type MaLoi } from "@/features/ma-loi/api";
import { thietBiApi, type ThietBi } from "@/features/thiet-bi/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { useToast } from "@/lib/toast";

export default function AdminDashboardPage() {
  const toast = useToast();
  const [thietBis, setThietBis] = useState<ThietBi[]>([]);
  const [maLois, setMaLois] = useState<MaLoi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([thietBiApi.listAdmin(), maLoiApi.listAdmin()])
      .then(([tbs, list]) => {
        if (cancelled) return;
        setThietBis(tbs);
        setMaLois(list);
      })
      .catch((e) => {
        if (cancelled) return;
        toast.error(
          "Lỗi tải dữ liệu",
          e instanceof ApiError ? e.message : "Lỗi không xác định",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tongLuotXem = maLois.reduce((s, m) => s + (m.luotXem ?? 0), 0);
  const topMaLois = [...maLois]
    .sort((a, b) => (b.luotXem ?? 0) - (a.luotXem ?? 0))
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl">Bảng điều khiển</h1>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Tổng quan thiết bị, mã lỗi và lượt tra cứu của hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Cpu className="size-5" />}
          tone="ink"
          label="Tổng thiết bị"
          value={loading ? "···" : String(thietBis.length)}
        />
        <StatCard
          icon={<AlertCircle className="size-5" />}
          tone="amber"
          label="Tổng mã lỗi"
          value={loading ? "···" : String(maLois.length)}
        />
        <StatCard
          icon={<Eye className="size-5" />}
          tone="emerald"
          label="Tổng lượt tra cứu"
          value={loading ? "···" : tongLuotXem.toLocaleString("vi-VN")}
        />
        <StatCard
          icon={<AlertCircle className="size-5" />}
          tone="rose"
          label="Lỗi nghiêm trọng"
          value={
            loading
              ? "···"
              : String(maLois.filter((m) => m.mucDo === "NGHIEM_TRONG").length)
          }
        />
      </div>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] pb-3">
          <h2 className="font-medium">Mã lỗi được tra nhiều nhất</h2>
          <Link
            href="/quan-tri/ma-loi"
            className="text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            Tất cả →
          </Link>
        </div>
        {loading ? (
          <p className="py-6 text-center text-xs text-[color:var(--color-muted)]">
            Đang tải...
          </p>
        ) : topMaLois.length === 0 ? (
          <p className="py-6 text-center text-xs text-[color:var(--color-muted)]">
            Chưa có mã lỗi nào.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {topMaLois.map((m) => (
              <Link
                key={m.id}
                href={`/tra-cuu/${m.id}`}
                target="_blank"
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-[color:var(--color-ivory-2)]"
              >
                <span className="rounded-md bg-[color:var(--color-ink)] px-2 py-1 font-mono text-xs text-white">
                  {m.maLoi}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.tenLoi}</p>
                  <p className="text-xs text-[color:var(--color-muted)]">
                    {m.tenThietBi ?? "—"}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] uppercase ring-1",
                    MUC_DO_BADGE[m.mucDo],
                  )}
                >
                  {MUC_DO_LABEL[m.mucDo]}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[color:var(--color-muted)]">
                  <Eye className="size-3" />
                  {m.luotXem.toLocaleString("vi-VN")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-medium text-[color:var(--color-muted)]">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <QuickLink href="/quan-tri/thiet-bi" icon={<Cpu />} title="Thiết bị" count={thietBis.length} />
          <QuickLink href="/quan-tri/ma-loi" icon={<AlertCircle />} title="Mã lỗi" count={maLois.length} />
          <QuickLink href="/quan-tri/nguoi-dung" icon={<Users />} title="Người dùng" />
          <QuickLink href="/quan-tri/cau-hinh" icon={<Settings />} title="Cấu hình" />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  tone: "emerald" | "rose" | "amber" | "ink";
  label: string;
  value: string;
  hint?: string;
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    ink: "bg-[color:var(--color-ivory-2)] text-[color:var(--color-ink)] ring-[color:var(--color-border)]",
  } as const;
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-[color:var(--color-border)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-[color:var(--color-muted)]">
          {label}
        </p>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-full ring-1",
            tones[tone],
          )}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 font-serif text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-[color:var(--color-muted)]">{hint}</p>}
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-[color:var(--color-border)] transition hover:ring-[color:var(--color-ink)]"
    >
      <div className="flex items-center gap-3">
        <span className="text-[color:var(--color-ink)]">{icon}</span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          {count !== undefined && (
            <p className="text-xs text-[color:var(--color-muted)]">{count} mục</p>
          )}
        </div>
      </div>
      <ArrowUpRight className="size-4 text-[color:var(--color-muted)] transition group-hover:text-[color:var(--color-ink)]" />
    </Link>
  );
}

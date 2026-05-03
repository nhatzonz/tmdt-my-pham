"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Package,
  PackageX,
  Receipt,
  Truck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  type Overview,
  type OrderStatusBreakdown,
  type RevenueDay,
  type TopProduct,
  reportApi,
} from "@/features/bao-cao/api";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/features/don-hang/api";
import { imageUrl } from "@/features/san-pham/api";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/lib/toast";

export default function AdminDashboardPage() {
  const toast = useToast();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [revenue, setRevenue] = useState<RevenueDay[]>([]);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [breakdown, setBreakdown] = useState<OrderStatusBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<7 | 14 | 30 | 90>(30);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      reportApi.overview(),
      reportApi.revenue(days),
      reportApi.topProducts(10),
      reportApi.orderStatus(),
    ])
      .then(([o, r, t, s]) => {
        if (cancelled) return;
        setOverview(o);
        setRevenue(r);
        setTop(t);
        setBreakdown(s);
      })
      .catch((e) => {
        if (cancelled) return;
        toast.error(
          "Lỗi tải báo cáo",
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
  }, [days]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Bảng điều khiển</h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Tổng quan doanh thu, đơn hàng, tồn kho — cập nhật theo thời gian thực.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {([7, 14, 30, 90] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs transition",
                days === d
                  ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-white"
                  : "border-[color:var(--color-border)] text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-ink)]",
              )}
            >
              {d} ngày
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CheckCircle2 className="size-5" />}
          tone="emerald"
          label="Doanh thu 30 ngày"
          value={overview ? formatCurrency(overview.doanhThu30Ngay) : "—"}
          hint={
            overview
              ? `Hôm nay: ${formatCurrency(overview.doanhThuHomNay)}`
              : undefined
          }
          loading={loading}
        />
        <StatCard
          icon={<Receipt className="size-5" />}
          tone="ink"
          label="Đơn hoàn tất 30 ngày"
          value={overview ? String(overview.donCompleted30Ngay) : "—"}
          hint={
            overview
              ? `${overview.donCancelled30Ngay} đơn đã huỷ`
              : undefined
          }
          loading={loading}
        />
        <StatCard
          icon={<Truck className="size-5" />}
          tone="amber"
          label="Đơn đang xử lý"
          value={
            overview
              ? String(overview.donPending + overview.donShipping)
              : "—"
          }
          hint={
            overview
              ? `${overview.donPending} chờ · ${overview.donShipping} đang giao`
              : undefined
          }
          loading={loading}
        />
        <StatCard
          icon={<PackageX className="size-5" />}
          tone="rose"
          label="Sản phẩm hết hàng"
          value={overview ? String(overview.spHetHang) : "—"}
          hint={
            overview
              ? `${overview.spCanhBao} sp dưới ngưỡng cảnh báo`
              : undefined
          }
          loading={loading}
        />
      </div>

      {}
      <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] pb-3">
          <h2 className="font-medium">Doanh thu {days} ngày gần nhất</h2>
          <span className="text-xs text-[color:var(--color-muted)]">
            Chỉ tính đơn đã hoàn tất
          </span>
        </div>
        <div className="mt-4 h-72">
          {loading ? (
            <SkeletonBlock />
          ) : revenue.every((d) => d.tongTien === 0) ? (
            <EmptyChart message="Chưa có đơn hoàn tất nào trong khoảng này" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                <XAxis
                  dataKey="ngay"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v)), "Doanh thu"]}
                  labelFormatter={(v) =>
                    new Date(String(v)).toLocaleDateString("vi-VN")
                  }
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="tongTien"
                  stroke="#1a1a1a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <div className="flex items-center justify-between border-b border-[color:var(--color-border)] pb-3">
            <h2 className="font-medium">Top 10 sản phẩm bán chạy</h2>
            <Link
              href="/quan-tri/san-pham"
              className="text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
            >
              Tất cả →
            </Link>
          </div>
          <div className="mt-4">
            {loading ? (
              <SkeletonBlock />
            ) : top.length === 0 ? (
              <EmptyChart message="Chưa có sản phẩm nào được mua" />
            ) : (
              <div className="flex flex-col gap-3">
                {top.map((p, idx) => (
                  <div key={p.sanPhamId} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-medium text-[color:var(--color-muted)]">
                      #{idx + 1}
                    </span>
                    <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-[color:var(--color-ivory-2)]">
                      {p.hinhAnh && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={imageUrl(p.hinhAnh) ?? ""}
                          alt={p.tenSanPham}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{p.tenSanPham}</p>
                      <p className="text-xs text-[color:var(--color-muted)]">
                        Đã bán {p.soLuongDaBan}
                      </p>
                    </div>
                    <div className="text-right text-sm font-medium">
                      {formatCurrency(p.doanhThu)}
                    </div>
                  </div>
                ))}
                {}
                <div className="mt-3 h-40 border-t border-[color:var(--color-border)] pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={top.slice(0, 5)}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="tenSanPham"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v: string) =>
                          v.length > 12 ? v.slice(0, 11) + "…" : v
                        }
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(v) => [String(v), "Đã bán"]}
                        contentStyle={{ borderRadius: 12, fontSize: 12 }}
                      />
                      <Bar dataKey="soLuongDaBan" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </section>

        {}
        <section className="rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)]">
          <div className="flex items-center justify-between border-b border-[color:var(--color-border)] pb-3">
            <h2 className="font-medium">Phân bố trạng thái đơn</h2>
            <Link
              href="/quan-tri/don-hang"
              className="text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
            >
              Tất cả →
            </Link>
          </div>
          <div className="mt-4 h-72">
            {loading ? (
              <SkeletonBlock />
            ) : !breakdown ||
              Object.values(breakdown).every((v) => v === 0) ? (
              <EmptyChart message="Chưa có đơn nào" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value: string) =>
                      ORDER_STATUS_LABEL[value as OrderStatus] ?? value
                    }
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Pie
                    data={(Object.keys(breakdown) as OrderStatus[])
                      .filter((s) => breakdown[s] > 0)
                      .map((s) => ({
                        name: s,
                        value: breakdown[s],
                      }))}
                    dataKey="value"
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {(Object.keys(breakdown) as OrderStatus[])
                      .filter((s) => breakdown[s] > 0)
                      .map((s) => (
                        <Cell key={s} fill={STATUS_COLORS[s]} />
                      ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      {}
      <section>
        <h2 className="mb-4 font-medium text-[color:var(--color-muted)]">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <QuickLink href="/quan-tri/san-pham" icon={<Package />} title="Sản phẩm" count={overview?.tongSanPham} />
          <QuickLink href="/quan-tri/danh-muc" icon={<Package />} title="Danh mục" count={overview?.tongDanhMuc} />
          <QuickLink href="/quan-tri/nguoi-dung" icon={<Users />} title="Người dùng" count={overview?.tongUser} />
          <QuickLink href="/quan-tri/khuyen-mai" icon={<Receipt />} title="Mã giảm giá" count={overview?.tongCouponHoatDong} />
        </div>
      </section>
    </div>
  );
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "#f59e0b",
  SHIPPING: "#10b981",
  COMPLETED: "#1a1a1a",
  CANCELLED: "#e11d48",
};

function StatCard({
  icon,
  tone,
  label,
  value,
  hint,
  loading,
}: {
  icon: React.ReactNode;
  tone: "emerald" | "rose" | "amber" | "ink";
  label: string;
  value: string;
  hint?: string;
  loading?: boolean;
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
      <p className="mt-3 font-serif text-2xl">{loading ? "···" : value}</p>
      {hint && (
        <p className="mt-1 text-xs text-[color:var(--color-muted)]">{hint}</p>
      )}
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

function SkeletonBlock() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-[color:var(--color-muted)]">
      Đang tải...
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-[color:var(--color-muted)]">
      <AlertTriangle className="size-6 opacity-40" />
      <p className="text-xs">{message}</p>
    </div>
  );
}


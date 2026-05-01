import Link from "next/link";
import { ArrowRight, Boxes, Package, Receipt, Tag, Ticket, Users } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">Bảng điều khiển</h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
        Quản trị hệ thống Ngọc Lan Beauty.
      </p>

      <div className="mt-10 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        <AdminCard
          href="/quan-tri/danh-muc"
          icon={<Tag className="size-7" />}
          title="Danh mục"
          desc="Tạo và xem danh mục sản phẩm"
        />
        <AdminCard
          href="/quan-tri/san-pham"
          icon={<Package className="size-7" />}
          title="Sản phẩm"
          desc="Tạo sản phẩm (kèm loại da cho AI - UC 2.3.3)"
        />
        <AdminCard
          href="/quan-tri/ton-kho"
          icon={<Boxes className="size-7" />}
          title="Tồn kho"
          desc="Nhập / xuất / cảnh báo hết hàng"
        />
        <AdminCard
          href="/quan-tri/khuyen-mai"
          icon={<Ticket className="size-7" />}
          title="Khuyến mãi"
          desc="Mã giảm giá theo % và thời hạn"
        />
        <AdminCard
          href="/quan-tri/don-hang"
          icon={<Receipt className="size-7" />}
          title="Đơn hàng"
          desc="Xử lý đơn — chuyển trạng thái và huỷ"
        />
        <AdminCard
          href="/quan-tri/nguoi-dung"
          icon={<Users className="size-7" />}
          title="Người dùng"
          desc="Tạo, sửa, đặt lại mật khẩu và xoá tài khoản"
        />
      </div>
    </div>
  );
}

function AdminCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-[color:var(--color-border)] transition hover:ring-[color:var(--color-ink)]"
    >
      <div className="text-[color:var(--color-ink)]">{icon}</div>
      <div className="flex items-center gap-2">
        <h2 className="font-medium">{title}</h2>
        <ArrowRight className="size-4 opacity-0 transition group-hover:opacity-100" />
      </div>
      <p className="text-sm text-[color:var(--color-muted)]">{desc}</p>
    </Link>
  );
}

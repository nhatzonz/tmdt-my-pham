export function TopBar() {
  return (
    <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-ivory-2)] text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
        <p className="text-[color:var(--color-muted)]">
          <span className="mr-2">✦</span>
          Miễn phí vận chuyển cho đơn từ 500.000đ · Mẫu thử miễn phí mọi đơn hàng
        </p>
        <div className="flex items-center gap-6 text-[color:var(--color-muted)]">
          <span>VN · VND</span>
          <span>Hỗ trợ 24/7</span>
        </div>
      </div>
    </div>
  );
}

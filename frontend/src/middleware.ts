import { NextResponse } from "next/server";

// JWT hiện lưu localStorage (plan §3) — middleware chạy ở edge không đọc được
// localStorage. Guard thực tế cho /quan-tri/* sẽ đặt ở client-side admin layout
// (tuần 6 khi code module Auth). File này giữ chỗ để sau migrate sang cookie
// httpOnly hoặc bổ sung rule khác không phải kiến trúc lại routing.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/quan-tri/:path*"],
};

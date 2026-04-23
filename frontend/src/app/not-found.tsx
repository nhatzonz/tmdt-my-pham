import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600">Trang không tồn tại.</p>
      <Link href="/" className="text-blue-600 underline">
        Về trang chủ
      </Link>
    </main>
  );
}

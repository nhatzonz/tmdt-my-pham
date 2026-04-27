import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[color:var(--color-ivory)]">
      {/* Left — brand panel */}
      <section
  className="relative hidden w-1/2 overflow-hidden p-12 lg:flex lg:flex-col bg-cover bg-center"
  style={{
    backgroundImage: "url('https://images.squarespace-cdn.com/content/v1/53883795e4b016c956b8d243/1601476423631-SY6N56SXJBX2ZGIWXCVF/image-asset.jpeg')",
  }}
>

        <Link
          href="/"
          className="relative flex items-center gap-2 text-[color:var(--color-ink)]"
        >
          <Image
            src="/logo.png"
            alt="Ngọc Lan Beauty"
            width={48}
            height={48}
            className="size-12 object-contain"
            priority
          />
          <span className="font-serif text-2xl italic leading-none">Ngọc Lan Beauty</span>
        </Link>

        
      </section>

      {/* Right — form */}
      <section className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between px-8 py-6 lg:justify-end">
        </div>
        <div className="flex flex-1 items-center justify-center px-8 pb-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </div>
  );
}

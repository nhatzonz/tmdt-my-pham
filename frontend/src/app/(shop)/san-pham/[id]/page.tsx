import { notFound } from "next/navigation";
import { productApi } from "@/features/san-pham/api";
import { ApiError } from "@/lib/api-client";
import { ProductDetailClient } from "./ProductDetailClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SanPhamDetailPage({ params }: PageProps) {
  const { id } = await params;
  try {
    const product = await productApi.getById(id);
    return <ProductDetailClient product={product} />;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

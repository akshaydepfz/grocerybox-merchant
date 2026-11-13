import type { Metadata } from "next";

import { ProductDetailScreen } from "@/features/products/components";

type ProductDetailPageProps = {
  params: Promise<{ productId: string }>;
};

export const metadata: Metadata = {
  title: "Product details | GroceryBox Merchant",
  description: "View product details and inventory",
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { productId } = await params;
  return <ProductDetailScreen productId={productId} />;
}

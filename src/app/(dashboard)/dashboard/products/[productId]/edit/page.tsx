import type { Metadata } from "next";

import { ProductFormPlaceholderScreen } from "@/features/products/components";

type EditProductPageProps = {
  params: Promise<{ productId: string }>;
};

export const metadata: Metadata = {
  title: "Edit Product | GroceryBox Merchant",
  description: "Update product details and inventory",
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = await params;
  return <ProductFormPlaceholderScreen mode="edit" productId={productId} />;
}

import type { Metadata } from "next";

import { ProductFormPlaceholderScreen } from "@/features/products/components";

export const metadata: Metadata = {
  title: "Add Product | GroceryBox Merchant",
  description: "Add a new product to your store catalog",
};

export default function NewProductPage() {
  return <ProductFormPlaceholderScreen mode="create" />;
}

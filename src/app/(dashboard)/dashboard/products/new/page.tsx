import type { Metadata } from "next";

import { ProductCreateScreen } from "@/features/products/components";

export const metadata: Metadata = {
  title: "Add Product | GroceryBox Merchant",
  description: "Add a new product to your store catalog",
};

export default function NewProductPage() {
  return <ProductCreateScreen />;
}

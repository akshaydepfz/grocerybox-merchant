import type { Metadata } from "next";

import { CategoriesScreen } from "@/features/categories/components";

export const metadata: Metadata = {
  title: "Categories | GroceryBox Merchant",
  description: "Manage product categories for your store",
};

export default function CategoriesPage() {
  return <CategoriesScreen />;
}

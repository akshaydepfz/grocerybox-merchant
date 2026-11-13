import type { Metadata } from "next";

import { SubcategoriesScreen } from "@/features/subcategories/components";

type PageProps = {
  params: Promise<{ categoryId: string }>;
};

export const metadata: Metadata = {
  title: "Subcategories | GroceryBox Merchant",
  description: "Manage subcategories under a main category",
};

export default async function SubcategoriesPage({ params }: PageProps) {
  const { categoryId } = await params;
  return <SubcategoriesScreen categoryId={categoryId} />;
}

import type { Metadata } from "next";

import { SubcategoryFormScreen } from "@/features/subcategories/components";

type PageProps = {
  params: Promise<{ categoryId: string; subcategoryId: string }>;
};

export const metadata: Metadata = {
  title: "Edit subcategory | GroceryBox Merchant",
  description: "Update subcategory details",
};

export default async function EditSubcategoryPage({ params }: PageProps) {
  const { categoryId, subcategoryId } = await params;
  return (
    <SubcategoryFormScreen
      categoryId={categoryId}
      mode="edit"
      subcategoryId={subcategoryId}
    />
  );
}

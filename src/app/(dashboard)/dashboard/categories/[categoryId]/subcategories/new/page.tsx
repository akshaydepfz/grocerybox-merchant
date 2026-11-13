import type { Metadata } from "next";

import { SubcategoryFormScreen } from "@/features/subcategories/components";

type PageProps = {
  params: Promise<{ categoryId: string }>;
};

export const metadata: Metadata = {
  title: "Add subcategory | GroceryBox Merchant",
  description: "Create a new subcategory",
};

export default async function NewSubcategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  return <SubcategoryFormScreen categoryId={categoryId} mode="create" />;
}

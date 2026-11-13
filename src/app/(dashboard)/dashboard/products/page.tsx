import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { ProductsScreen } from "@/features/products/components";

export const metadata: Metadata = {
  title: "Products | GroceryBox Merchant",
  description: "Manage your store products and inventory",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingIndicator label="Loading products" />
        </div>
      }
    >
      <ProductsScreen />
    </Suspense>
  );
}

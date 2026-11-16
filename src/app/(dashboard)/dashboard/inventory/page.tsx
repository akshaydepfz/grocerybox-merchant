import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { InventoryScreen } from "@/features/inventory/components";

export const metadata: Metadata = {
  title: "Inventory | GroceryBox Merchant",
  description: "Track stock levels and update inventory",
};

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingIndicator label="Loading inventory" />
        </div>
      }
    >
      <InventoryScreen />
    </Suspense>
  );
}
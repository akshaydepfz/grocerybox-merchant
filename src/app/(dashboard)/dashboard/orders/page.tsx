import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { OrdersScreen } from "@/features/orders/components";

export const metadata: Metadata = {
  title: "Orders | GroceryBox Merchant",
  description: "View and fulfill storefront customer orders",
};

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingIndicator label="Loading orders" />
        </div>
      }
    >
      <OrdersScreen />
    </Suspense>
  );
}

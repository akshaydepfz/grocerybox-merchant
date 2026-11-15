import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { CustomersScreen } from "@/features/customers/components";

export const metadata: Metadata = {
  title: "Customers | GroceryBox Merchant",
  description: "View storefront customers by phone — orders and saved addresses",
};

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingIndicator label="Loading customers" />
        </div>
      }
    >
      <CustomersScreen />
    </Suspense>
  );
}
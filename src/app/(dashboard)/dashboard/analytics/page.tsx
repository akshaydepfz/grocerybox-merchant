import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { AnalyticsScreen } from "@/features/analytics/components";

export const metadata: Metadata = {
  title: "Analytics | GroceryBox Merchant",
  description: "Store sales, orders, and product performance",
};

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingIndicator label="Loading analytics" />
        </div>
      }
    >
      <AnalyticsScreen />
    </Suspense>
  );
}
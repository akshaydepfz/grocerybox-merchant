import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { StoreSettingsScreen } from "@/features/store-settings/components";

export const metadata: Metadata = {
  title: "Store Settings | GroceryBox Merchant",
  description: "Configure order channels, payments, and delivery for your store",
};

export default function StoreSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingIndicator label="Loading store settings" />
        </div>
      }
    >
      <StoreSettingsScreen />
    </Suspense>
  );
}

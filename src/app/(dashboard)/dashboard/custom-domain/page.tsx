import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { CustomDomainScreen } from "@/features/custom-domain/components";

export const metadata: Metadata = {
  title: "Custom Domain | GroceryBox Merchant",
  description:
    "Connect storefront and delivery custom domains for your grocery store",
};

export default function CustomDomainPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingIndicator label="Loading custom domains" />
        </div>
      }
    >
      <CustomDomainScreen />
    </Suspense>
  );
}
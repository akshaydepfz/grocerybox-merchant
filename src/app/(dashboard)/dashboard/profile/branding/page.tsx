import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { StoreBrandingScreen } from "@/features/onboarding/components/store-branding-screen";

export const metadata: Metadata = {
  title: "Edit Branding | GroceryBox Merchant",
  description: "Update your store logo, banner, and brand colours",
};

export default function MerchantProfileBrandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingIndicator label="Loading branding editor" />
        </div>
      }
    >
      <StoreBrandingScreen mode="edit" />
    </Suspense>
  );
}
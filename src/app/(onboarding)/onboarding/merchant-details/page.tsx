import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { MerchantDetailsScreen } from "@/features/onboarding/components/merchant-details-screen";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Business Information",
  description: "Tell us about your business and store.",
};

/** Flutter `MerchantDetailsScreen` — step 1 of merchant onboarding. */
export default function MerchantDetailsPage() {
  return (
    <div className={inter.className}>
      <MerchantDetailsScreen />
    </div>
  );
}

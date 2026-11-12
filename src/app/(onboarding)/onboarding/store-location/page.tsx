import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { StoreLocationScreen } from "@/features/onboarding/components/store-location-screen";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Store Location",
  description: "Set your store address and delivery map pin.",
};

/** Flutter `StoreLocationScreen` — onboarding step 4. */
export default function StoreLocationPage() {
  return (
    <div className={inter.className}>
      <StoreLocationScreen />
    </div>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { StoreIdentityScreen } from "@/features/onboarding/components/store-identity-screen";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Store Identity",
  description: "Create your online store identity and web address.",
};

/** Flutter `StoreIdentityScreen` — onboarding step 2. */
export default function StoreIdentityPage() {
  return (
    <div className={inter.className}>
      <StoreIdentityScreen />
    </div>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { StoreConfigScreen } from "@/features/onboarding/components/store-config-screen";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Store Configuration",
  description: "Configure orders, delivery, and payment options for your store.",
};

/** Flutter `StoreConfigScreen` — onboarding step 5. */
export default function StoreConfigPage() {
  return (
    <div className={inter.className}>
      <StoreConfigScreen />
    </div>
  );
}

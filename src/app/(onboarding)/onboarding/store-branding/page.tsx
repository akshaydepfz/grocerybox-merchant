import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { StoreBrandingScreen } from "@/features/onboarding/components/store-branding-screen";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Store Branding",
  description: "Upload your logo and banner and set your store brand colours.",
};

/** Flutter `StoreBrandingScreen` — onboarding step 3. */
export default function StoreBrandingPage() {
  return (
    <div className={inter.className}>
      <StoreBrandingScreen />
    </div>
  );
}

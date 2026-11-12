import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { OnboardingReviewScreen } from "@/features/onboarding/components/onboarding-review-screen";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Review & Publish",
  description: "Review onboarding and publish your store.",
};

/** Flutter `OnboardingReviewScreen` — final onboarding step. */
export default function OnboardingReviewPage() {
  return (
    <div className={inter.className}>
      <OnboardingReviewScreen />
    </div>
  );
}

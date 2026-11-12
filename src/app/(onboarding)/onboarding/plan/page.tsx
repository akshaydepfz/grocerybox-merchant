import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { PlanScreen } from "@/features/onboarding/components/plan-screen";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Choose Plan",
  description: "Select a subscription plan to publish your store.",
};

/** Flutter `PlanScreen` — onboarding subscription step. */
export default function PlanPage() {
  return (
    <div className={inter.className}>
      <PlanScreen />
    </div>
  );
}

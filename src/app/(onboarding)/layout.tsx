import type { ReactNode } from "react";

import { OnboardingRouteGate } from "@/features/onboarding/components/onboarding-route-gate";

/** Onboarding screens use Flutter `MerchantOnboardingScreenLayout` per page. */
export default function OnboardingRouteGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OnboardingRouteGate>{children}</OnboardingRouteGate>;
}

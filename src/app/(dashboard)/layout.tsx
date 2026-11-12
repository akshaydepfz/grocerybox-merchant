import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { DashboardOnboardingGate } from "@/features/onboarding/components/dashboard-onboarding-gate";

export default function DashboardRouteGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardOnboardingGate>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardOnboardingGate>
  );
}

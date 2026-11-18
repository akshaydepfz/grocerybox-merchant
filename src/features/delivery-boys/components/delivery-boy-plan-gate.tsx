"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Crown, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { dashboardRoutePrefix } from "@/config/routes";
import { ONBOARDING_PLAN_PATH } from "@/features/onboarding/utils/onboarding-resume";
import { useDeliveryBoyManagementResolved } from "@/features/profile/hooks/use-delivery-boy-management";

type DeliveryBoyPlanGateProps = {
  children: ReactNode;
};

export function DeliveryBoyPlanGate({ children }: DeliveryBoyPlanGateProps) {
  const { enabled, isLoading } = useDeliveryBoyManagementResolved();

  if (isLoading) {
    return (
      <DashboardPage>
        <GroceryAnimatedLoader label="Loading account" className="py-16" />
      </DashboardPage>
    );
  }

  if (!enabled) {
    return (
      <DashboardPage>
        <DashboardSurface className="mx-auto max-w-lg p-6 text-center sm:p-8">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#fff7ed] text-[#ea580c]">
            <Truck className="size-7" aria-hidden />
          </span>
          <h1 className="mt-4 text-lg font-bold text-[#1a1f2e]">
            Delivery partner management
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
            Add and manage delivery partners on Growth (₹399) or Pro (₹599).
            Your current plan does not include this feature.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              className="h-11 rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d]"
              asChild
            >
              <Link href={ONBOARDING_PLAN_PATH}>
                <Crown className="size-4" aria-hidden />
                View plans
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              asChild
            >
              <Link href={dashboardRoutePrefix}>Back to dashboard</Link>
            </Button>
          </div>
        </DashboardSurface>
      </DashboardPage>
    );
  }

  return <>{children}</>;
}
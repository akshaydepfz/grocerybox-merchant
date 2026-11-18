"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronRight,
  Loader2,
  Package,
  Truck,
  UserCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { listMerchantDeliveryBoys } from "@/features/delivery-boys/services";
import { deliveryBoyInitials } from "@/features/delivery-boys/utils/format-delivery-boy";
import { useDeliveryBoyManagementEnabled } from "@/features/profile/hooks/use-delivery-boy-management";
import { cn } from "@/lib/utils";

import {
  MERCHANT_ORDER_FULFILLMENT_STEPS,
  nextMerchantOrderStep,
  nextStepActionLabel,
  type MerchantOrderDetail,
  type MerchantOrderTimelineStep,
} from "../types/merchant-order";
import { orderStepLabel } from "../utils/format-order";

const STEP_ICONS = {
  placed: Package,
  confirmed: Check,
  packing: Package,
  out_for_delivery: Truck,
  delivered: Check,
} as const;

type OrderFulfillmentPanelProps = {
  order: MerchantOrderDetail;
  pending: boolean;
  onAdvance: (step: MerchantOrderTimelineStep, deliveryBoyId?: string) => void;
};

export function OrderFulfillmentPanel({
  order,
  pending,
  onAdvance,
}: OrderFulfillmentPanelProps) {
  const deliveryBoyManagement = useDeliveryBoyManagementEnabled();
  const steps = MERCHANT_ORDER_FULFILLMENT_STEPS;
  const currentIndex = steps.findIndex((step) => step.id === order.currentStep);
  const nextStep = nextMerchantOrderStep(order.currentStep);
  const isHomeDelivery = order.fulfillmentMethod === "home_delivery";
  const dispatchStep =
    nextStep === "out_for_delivery" ||
    (order.currentStep === "out_for_delivery" && nextStep === "delivered");
  const needsPartnerPicker =
    deliveryBoyManagement &&
    isHomeDelivery &&
    (nextStep === "out_for_delivery" || order.currentStep === "out_for_delivery");

  const partnersQuery = useQuery({
    queryKey: ["merchant-delivery-boys", "assignable"],
    queryFn: () =>
      listMerchantDeliveryBoys({ page: 1, limit: 100, status: "active" }),
    enabled: needsPartnerPicker,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const activePartners = partnersQuery.data?.items ?? [];
  const [selectedPartnerId, setSelectedPartnerId] = useState(
    order.deliveryBoy?.id ?? "",
  );

  useEffect(() => {
    setSelectedPartnerId(order.deliveryBoy?.id ?? "");
  }, [order.deliveryBoy?.id, order.id]);

  const partnerRequired = needsPartnerPicker && activePartners.length > 0;

  const canAdvance = useMemo(() => {
    if (!nextStep || pending) return false;
    if (nextStep === "out_for_delivery" && partnerRequired && !selectedPartnerId) {
      return false;
    }
    return true;
  }, [nextStep, pending, partnerRequired, selectedPartnerId]);

  const handleAdvance = () => {
    if (!nextStep) return;
    onAdvance(
      nextStep,
      nextStep === "out_for_delivery" ? selectedPartnerId || undefined : undefined,
    );
  };

  return (
    <DashboardSurface className="overflow-hidden p-0">
      <div className="border-b border-[#f0f1f4] bg-gradient-to-r from-[#f0fdf4] to-white px-4 py-4 sm:px-5">
        <h2 className="text-base font-semibold text-[#1a1f2e]">
          Fulfillment progress
        </h2>
        <p className="mt-0.5 text-xs text-[#9ca3af]">
          Advance one step at a time — customers see the same timeline on
          tracking.
        </p>
      </div>

      <ol className="divide-y divide-[#f0f1f4]">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS];
          const complete = currentIndex > index;
          const current = order.currentStep === step.id;
          const upcoming = currentIndex < index;
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3.5 sm:px-5",
                current && "bg-[#fafdfb]",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border",
                  complete &&
                    "border-[#16a34a] bg-[#dcfce7] text-[#15803d]",
                  current &&
                    "border-[#16a34a] bg-white text-[#16a34a] ring-2 ring-[#bbf7d0]",
                  upcoming && "border-[#e5e7eb] bg-[#f9fafb] text-[#9ca3af]",
                )}
              >
                {complete ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Icon className="size-4" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    current ? "text-[#15803d]" : "text-[#1a1f2e]",
                    upcoming && "text-[#9ca3af]",
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-[#9ca3af]">
                  {complete
                    ? "Completed"
                    : current
                      ? "Current status"
                      : "Upcoming"}
                </p>
              </div>
              {current ? (
                <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#15803d]">
                  Now
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      {order.deliveryBoy ? (
        <div className="border-t border-[#f0f1f4] bg-[#fafbfc] px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
            Assigned partner
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1a1f2e]">
            {order.deliveryBoy.fullName}
          </p>
        </div>
      ) : null}

      {needsPartnerPicker ? (
        <div className="border-t border-[#f0f1f4] px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-[#16a34a]" aria-hidden />
            <h3 className="text-sm font-semibold text-[#1a1f2e]">
              {nextStep === "out_for_delivery"
                ? "Assign delivery partner"
                : "Delivery partner"}
            </h3>
          </div>
          {partnersQuery.isLoading ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-[#6b7280]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading active partners…
            </p>
          ) : activePartners.length === 0 ? (
            <p className="mt-2 text-sm text-[#6b7280]">
              No active delivery partners — you can still dispatch without
              assignment.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {activePartners.map((partner) => {
                const selected = selectedPartnerId === partner.id;
                return (
                  <li key={partner.id}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setSelectedPartnerId(partner.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                        selected
                          ? "border-[#16a34a] bg-[#f0fdf4] ring-2 ring-[#bbf7d0]"
                          : "border-[#eceef2] bg-white hover:border-[#d1d5db]",
                      )}
                    >
                      <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#dcfce7] text-xs font-bold text-[#15803d]">
                        {deliveryBoyInitials(partner.fullName)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[#1a1f2e]">
                          {partner.fullName}
                        </span>
                        <span className="block text-xs text-[#9ca3af]">
                          {partner.totalDeliveries} completed
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {nextStep ? (
        <div className="border-t border-[#f0f1f4] px-4 py-4 sm:px-5">
          <Button
            type="button"
            className="h-11 w-full rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d] sm:h-10"
            disabled={!canAdvance}
            onClick={handleAdvance}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ChevronRight className="size-4" aria-hidden />
            )}
            <span className="ml-2">
              {nextStepActionLabel(nextStep)}
              {dispatchStep && isHomeDelivery
                ? ""
                : ` · ${orderStepLabel(nextStep)}`}
            </span>
          </Button>
          {partnerRequired && !selectedPartnerId ? (
            <p className="mt-2 text-center text-xs text-[#b45309]">
              Select a delivery partner to continue.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="border-t border-[#f0f1f4] bg-[#f0fdf4] px-4 py-4 text-center text-sm font-medium text-[#15803d] sm:px-5">
          Order fulfilled — no further action needed.
        </div>
      )}
    </DashboardSurface>
  );
}
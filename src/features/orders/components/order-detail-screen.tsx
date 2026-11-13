"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { dashboardRoutePrefix } from "@/config/routes";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  friendlyOrderError,
  getMerchantOrder,
  updateMerchantOrderStatus,
} from "../services";
import {
  MERCHANT_ORDER_STEPS,
  type MerchantOrderTimelineStep,
} from "../types/merchant-order";
import {
  formatCustomerPhone,
  formatInr,
  formatOrderDateTime,
  orderStepLabel,
} from "../utils/format-order";

import { OrderStepBadge } from "./order-step-badge";

type OrderDetailScreenProps = {
  orderId: string;
};

export function OrderDetailScreen({ orderId }: OrderDetailScreenProps) {
  const { user, isRegistered } = useAuth();
  const queryClient = useQueryClient();
  const listHref = `${dashboardRoutePrefix}/orders`;

  const detailQuery = useQuery({
    queryKey: ["merchant-order", orderId],
    queryFn: () => getMerchantOrder(orderId),
    enabled: Boolean(user && isRegistered && orderId),
    refetchOnWindowFocus: false,
  });

  const [draftStep, setDraftStep] = useState<MerchantOrderTimelineStep | null>(null);

  const updateMutation = useMutation({
    mutationFn: (step: MerchantOrderTimelineStep) =>
      updateMerchantOrderStatus(orderId, step),
    onSuccess: async (order) => {
      setDraftStep(null);
      await queryClient.invalidateQueries({ queryKey: ["merchant-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["merchant-order", orderId] });
      toast.success(`Order updated to “${orderStepLabel(order.currentStep)}”.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? friendlyOrderError(error)
          : "Unable to update order status.",
      );
    },
  });

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[960px] py-8">
        <ErrorState title="Sign in required" message="Sign in to view this order." />
      </div>
    );
  }

  if (detailQuery.isLoading && !detailQuery.data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading order"
          sublabel="Fetching order details"
        />
      </div>
    );
  }

  if (detailQuery.isError && !detailQuery.data) {
    const message =
      detailQuery.error instanceof ApiError
        ? friendlyOrderError(detailQuery.error)
        : "Unable to load order.";
    return (
      <div className="mx-auto w-full max-w-[960px] py-8">
        <ErrorState
          title="Could not load order"
          message={message}
          onRetry={() => void detailQuery.refetch()}
        />
      </div>
    );
  }

  const order = detailQuery.data;
  if (!order) {
    return null;
  }

  const selectedStep = draftStep ?? order.currentStep;
  const dirty = selectedStep !== order.currentStep;

  const addressLines = [
    order.address.fullName,
    [order.address.house, order.address.street].filter(Boolean).join(", "),
    order.address.landmark,
    [order.address.city, order.address.state, order.address.pinCode]
      .filter(Boolean)
      .join(", "),
    order.address.phone ? `Phone: ${order.address.phone}` : null,
  ].filter((line) => line && String(line).trim().length > 0);

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Link
          href={listHref}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#6b7280] transition hover:text-[#16a34a]"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to orders
        </Link>
        {detailQuery.isFetching && !detailQuery.isLoading ? (
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Refreshing…
          </div>
        ) : null}
      </div>

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
          {order.orderId}
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Placed {formatOrderDateTime(order.placedAt)} ·{" "}
          {formatCustomerPhone(order.customerPhone)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <OrderStepBadge step={order.currentStep} />
          <span className="rounded-full bg-[#f5f6f8] px-2.5 py-0.5 text-[11px] font-medium text-[#4b5563]">
            {order.paymentDisplay}
          </span>
        </div>
      </header>

      <DashboardSurface className="p-5">
        <h2 className="text-base font-semibold text-[#1a1f2e]">
          Fulfillment status
        </h2>
        <p className="mt-1 text-xs text-[#9ca3af]">
          Same five steps customers see on order tracking: placed → confirmed →
          packing → out for delivery → delivered.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {MERCHANT_ORDER_STEPS.map((step) => {
            const active = selectedStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => setDraftStep(step.id)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left text-sm transition",
                  active
                    ? "border-[#16a34a] bg-[#f0fdf4] text-[#15803d]"
                    : "border-[#eceef2] bg-white text-[#4b5563] hover:border-[#d1d5db]",
                )}
              >
                <p className="font-semibold">{step.title}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            className="bg-[#16a34a] text-white hover:bg-[#15803d]"
            disabled={!dirty || updateMutation.isPending}
            onClick={() => updateMutation.mutate(selectedStep)}
          >
            {updateMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="size-4" aria-hidden />
            )}
            <span className="ml-2">Save status</span>
          </Button>
        </div>
      </DashboardSurface>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardSurface className="p-5">
          <h2 className="text-sm font-semibold text-[#1a1f2e]">Delivery</h2>
          <p className="mt-1 text-sm text-[#6b7280]">{order.deliveryLabel}</p>
          {order.etaWindow ? (
            <p className="mt-2 text-xs text-[#9ca3af]">ETA: {order.etaWindow}</p>
          ) : null}
          <ul className="mt-4 space-y-1 text-sm text-[#4b5563]">
            {addressLines.map((line) => (
              <li key={String(line)}>{line}</li>
            ))}
          </ul>
          {order.deliveryInstructions ? (
            <p className="mt-3 text-xs text-[#6b7280]">
              Instructions: {order.deliveryInstructions}
            </p>
          ) : null}
          {order.orderNotes ? (
            <p className="mt-2 text-xs text-[#6b7280]">Notes: {order.orderNotes}</p>
          ) : null}
        </DashboardSurface>

        <DashboardSurface className="p-5">
          <h2 className="text-sm font-semibold text-[#1a1f2e]">Payment summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <SummaryRow label="Items" value={formatInr(order.pricing.sellingSubtotal)} />
            <SummaryRow label="Delivery" value={formatInr(order.pricing.deliveryFee)} />
            <SummaryRow label="Handling" value={formatInr(order.pricing.handlingFee)} />
            {order.pricing.couponDiscount > 0 ? (
              <SummaryRow
                label="Coupon"
                value={`-${formatInr(order.pricing.couponDiscount)}`}
              />
            ) : null}
            {order.pricing.tipAmount > 0 ? (
              <SummaryRow label="Tip" value={formatInr(order.pricing.tipAmount)} />
            ) : null}
            <SummaryRow label="To pay" value={formatInr(order.toPay)} bold />
          </dl>
        </DashboardSurface>
      </div>

      <DashboardSurface className="overflow-hidden p-0">
        <div className="border-b border-[#f0f1f4] px-5 py-3">
          <h2 className="text-sm font-semibold text-[#1a1f2e]">Items</h2>
        </div>
        <ul className="divide-y divide-[#f0f1f4]">
          {order.lines.map((line) => (
            <li
              key={`${line.productId}-${line.name}`}
              className="flex items-start justify-between gap-4 px-5 py-4"
            >
              <div>
                <p className="font-medium text-[#1a1f2e]">{line.name}</p>
                <p className="text-xs text-[#9ca3af]">
                  {line.quantity} × {line.unitLabel} · {formatInr(line.unitPrice)}
                </p>
              </div>
              <p className="font-semibold text-[#1a1f2e]">
                {formatInr(line.lineSellingTotal)}
              </p>
            </li>
          ))}
        </ul>
      </DashboardSurface>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[#6b7280]">{label}</dt>
      <dd className={bold ? "font-bold text-[#1a1f2e]" : "text-[#1a1f2e]"}>{value}</dd>
    </div>
  );
}

"use client";

import {
  BarChart3,
  Check,
  Info,
  Leaf,
  Crown,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { SubscriptionPlan } from "../types/subscription";

const PLAN_VISUALS: Record<
  string,
  { icon: LucideIcon; iconColor: string; background: string }
> = {
  starter: {
    icon: Leaf,
    iconColor: "#059669",
    background: "#ECFDF5",
  },
  pro: {
    icon: Crown,
    iconColor: "#F59E0B",
    background: "#FFFBEB",
  },
  growth: {
    icon: BarChart3,
    iconColor: "#15803D",
    background: "#DCFCE7",
  },
};

function planVisual(slug: string) {
  return PLAN_VISUALS[slug] ?? PLAN_VISUALS.growth;
}

export function PlanStatusBanner({
  message,
  tone,
  actionLabel,
  onAction,
}: {
  message: string;
  tone: "warning" | "error" | "success";
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colors = {
    warning: {
      bg: "#FFFBEB",
      border: "#FDE68A",
      text: "text-gb-mo-gray-800",
    },
    error: {
      bg: "#FEF2F2",
      border: "#FECACA",
      text: "text-gb-mo-gray-900",
    },
    success: {
      bg: "#F0FDF4",
      border: "#D1FAE5",
      text: "text-gb-mo-gray-900",
    },
  }[tone];

  return (
    <div
      className="flex items-start justify-between gap-3 rounded-xl border p-3.5"
      style={{ backgroundColor: colors.bg, borderColor: colors.border }}
    >
      <p className={cn("text-xs font-medium leading-snug", colors.text)}>
        {message}
      </p>
      {actionLabel && onAction ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto shrink-0 px-2 py-1 text-xs font-semibold"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function RazorpayInfoBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
      <Info className="mt-0.5 size-[18px] shrink-0 text-emerald-600" />
      <p className="text-xs font-medium leading-relaxed text-gb-mo-gray-700">
        Payments are processed securely via Razorpay. Your subscription activates
        only after server verification.
      </p>
    </div>
  );
}

function PlanFeatureList({ features }: { features: string[] }) {
  if (features.length === 0) {
    return (
      <p className="text-xs text-gb-mo-gray-500">Plan features will appear here.</p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="mt-0.5 size-[18px] shrink-0 text-gb-mo-brand-dark" />
          <span className="text-xs font-medium text-gb-mo-gray-600">
            {feature}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function PlanCard({
  plan,
  selected,
  onChoose,
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  onChoose: () => void;
}) {
  const visual = planVisual(plan.slug);
  const Icon = visual.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm",
        selected ? "border-gb-onboard-brand" : "border-gb-mo-gray-200",
      )}
    >
      <span
        className="flex size-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: visual.background }}
      >
        <Icon className="size-[22px]" style={{ color: visual.iconColor }} />
      </span>
      <h3 className="mt-4 text-lg font-bold text-gb-mo-gray-900">{plan.name}</h3>
      <p className="mt-1 text-xs text-gb-mo-gray-400">
        {plan.description || plan.slug}
      </p>
      <p className="mt-4 flex items-baseline gap-1">
        <span className="text-[32px] font-extrabold tracking-tight text-gb-mo-gray-900">
          ₹{plan.price}
        </span>
        <span className="text-xs text-gb-mo-gray-400">/ {plan.billingInterval}</span>
      </p>
      <div className="mt-5">
        <PlanFeatureList features={plan.features} />
      </div>
      <Button
        type="button"
        onClick={onChoose}
        className={cn(
          "mt-5 h-auto w-full rounded-full py-3 text-xs font-bold",
          selected
            ? "bg-gb-mo-continue text-gb-mo-gray-900 hover:brightness-95"
            : "border border-gb-mo-gray-900 bg-white text-gb-mo-gray-900 hover:bg-gb-mo-gray-50",
        )}
        variant={selected ? "default" : "outline"}
      >
        Choose Plan
      </Button>
    </div>
  );
}

export function PlanPricingGrid({
  twoCol,
  plans,
  selectedPlanId,
  onSelectPlan,
}: {
  twoCol: boolean;
  plans: SubscriptionPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (plan: SubscriptionPlan) => void;
}) {
  const cards = plans.map((plan) => (
    <PlanCard
      key={plan.planId}
      plan={plan}
      selected={plan.planId === selectedPlanId}
      onChoose={() => onSelectPlan(plan)}
    />
  ));

  if (twoCol && plans.length >= 3) {
    return (
      <div className="grid grid-cols-3 gap-4">{cards}</div>
    );
  }

  if (twoCol && plans.length === 2) {
    return <div className="grid grid-cols-2 gap-4">{cards}</div>;
  }

  return <div className="flex flex-col gap-4">{cards}</div>;
}

export function PlanLoadingState({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center py-12">{children}</div>
  );
}

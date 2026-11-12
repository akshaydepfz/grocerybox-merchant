"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  OnboardingSectionStatus,
  SubscriptionPublishStatus,
} from "../types/onboarding-review";

type MessageTone = "neutral" | "success" | "warning" | "error";

const TONE_STYLES: Record<
  MessageTone,
  { bg: string; border: string; text: string }
> = {
  neutral: {
    bg: "#F3F4F6",
    border: "#E5E7EB",
    text: "text-gb-mo-gray-800",
  },
  success: {
    bg: "#F0FDF4",
    border: "#D1FAE5",
    text: "text-gb-mo-gray-800",
  },
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
};

export function ReviewMessageCard({
  message,
  tone = "neutral",
  actionLabel,
  onAction,
}: {
  message: string;
  tone?: MessageTone;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const palette = TONE_STYLES[tone];

  return (
    <div
      className="flex items-start justify-between gap-3 rounded-xl border p-4"
      style={{ backgroundColor: palette.bg, borderColor: palette.border }}
    >
      <p className={cn("text-[13px] leading-snug", palette.text)}>{message}</p>
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

function subscriptionStatusCopy(status: SubscriptionPublishStatus): {
  title: string;
  body: string;
  action?: { label: string; kind: "plan" | "checkout" };
  tone: MessageTone;
} {
  switch (status) {
    case "active":
      return {
        title: "Subscription active",
        body: "Your plan is active. Publishing is allowed when all sections are complete.",
        tone: "success",
      };
    case "pending_payment":
      return {
        title: "Payment pending",
        body: "Complete Razorpay checkout to activate your subscription before publishing.",
        action: { label: "Continue to payment", kind: "checkout" },
        tone: "warning",
      };
    case "missing":
      return {
        title: "Subscription required",
        body: "Choose a subscription plan to publish your store.",
        action: { label: "Choose plan", kind: "plan" },
        tone: "warning",
      };
    case "expired":
    case "expired_by_date":
      return {
        title: "Subscription expired",
        body: "Renew your subscription to publish or keep your store live.",
        action: { label: "Renew plan", kind: "plan" },
        tone: "warning",
      };
    case "cancelled":
      return {
        title: "Subscription cancelled",
        body: "Select a new plan to continue.",
        action: { label: "Choose plan", kind: "plan" },
        tone: "warning",
      };
    case "invalid":
      return {
        title: "Subscription issue",
        body: "Your subscription cannot be used for publishing. Contact support or choose a plan again.",
        action: { label: "Review plans", kind: "plan" },
        tone: "error",
      };
    default:
      return {
        title: "Subscription status unknown",
        body: "Refresh review or choose a plan if publishing is blocked.",
        action: { label: "Choose plan", kind: "plan" },
        tone: "neutral",
      };
  }
}

export function SubscriptionStatusCard({
  status,
  onSelectPlan,
  onResumeCheckout,
}: {
  status: SubscriptionPublishStatus;
  onSelectPlan: () => void;
  onResumeCheckout: () => void;
}) {
  const content = subscriptionStatusCopy(status);
  const onAction =
    content.action?.kind === "checkout" ? onResumeCheckout : onSelectPlan;

  return (
    <ReviewMessageCard
      message={`${content.title}. ${content.body}`}
      tone={content.tone}
      actionLabel={content.action?.label}
      onAction={content.action ? onAction : undefined}
    />
  );
}

export function ReviewSectionRow({
  section,
}: {
  section: OnboardingSectionStatus;
}) {
  return (
    <div className="mb-2.5 flex items-start gap-2.5">
      {section.complete ? (
        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
      ) : (
        <Circle className="size-5 shrink-0 text-gb-mo-gray-400" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-gb-mo-gray-900">
          {section.label}
        </p>
        {!section.complete && section.missingFields.length > 0 ? (
          <p className="text-[11px] text-gb-mo-gray-500">
            Missing: {section.missingFields.join(", ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

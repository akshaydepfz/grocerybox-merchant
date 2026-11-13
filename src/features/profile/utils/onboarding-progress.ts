import type { MerchantOnboardingStatus } from "../types";

export const ONBOARDING_PROGRESS_STEPS: {
  status: MerchantOnboardingStatus;
  label: string;
}[] = [
  { status: "account_registered", label: "Account" },
  { status: "business_completed", label: "Business" },
  { status: "store_completed", label: "Store" },
  { status: "branding_completed", label: "Branding" },
  { status: "location_completed", label: "Location" },
  { status: "config_completed", label: "Configuration" },
  { status: "plan_selected", label: "Plan" },
  { status: "published", label: "Published" },
];

export function onboardingStatusIndex(
  status: MerchantOnboardingStatus,
): number {
  const index = ONBOARDING_PROGRESS_STEPS.findIndex(
    (step) => step.status === status,
  );
  return index >= 0 ? index : 0;
}

export function onboardingProgressPercent(
  status: MerchantOnboardingStatus,
): number {
  const index = onboardingStatusIndex(status);
  const total = ONBOARDING_PROGRESS_STEPS.length;
  if (total <= 1) return 0;
  return Math.round((index / (total - 1)) * 100);
}

export function isOnboardingStepComplete(
  currentStatus: MerchantOnboardingStatus,
  stepStatus: MerchantOnboardingStatus,
): boolean {
  return onboardingStatusIndex(currentStatus) >= onboardingStatusIndex(stepStatus);
}

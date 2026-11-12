import { dashboardRoutePrefix } from "@/config/routes";

import type { OnboardingReview, OnboardingSectionStatus } from "../types/onboarding-review";

/** Same order as backend publish validation (`onboarding_review.go`). */
export const ONBOARDING_SECTION_ORDER = [
  "merchant_account",
  "business_information",
  "store_identity",
  "store_branding",
  "store_location",
  "store_configuration",
  "subscription_plan",
] as const;

export const ONBOARDING_SECTION_PATHS: Record<string, string> = {
  business_information: "/onboarding/merchant-details",
  store_identity: "/onboarding/store-identity",
  store_branding: "/onboarding/store-branding",
  store_location: "/onboarding/store-location",
  store_configuration: "/onboarding/store-config",
  subscription_plan: "/onboarding/plan",
};

export const ONBOARDING_REVIEW_PATH = "/onboarding/review";
export const DASHBOARD_PATH = dashboardRoutePrefix;

const DEFAULT_RESUME_PATH = ONBOARDING_SECTION_PATHS.business_information;

export function findFirstIncompleteSection(
  sections: OnboardingSectionStatus[],
): OnboardingSectionStatus | null {
  const byKey = new Map(sections.map((section) => [section.key, section]));

  for (const key of ONBOARDING_SECTION_ORDER) {
    const section = byKey.get(key);
    if (section && !section.complete) {
      return section;
    }
  }

  return null;
}

/** Where signed-in merchants should land after auth (before or instead of dashboard). */
export function resolvePostAuthPath(review: OnboardingReview): string {
  if (review.storePublished) {
    return DASHBOARD_PATH;
  }

  const incomplete = findFirstIncompleteSection(review.sections);
  if (incomplete) {
    return (
      ONBOARDING_SECTION_PATHS[incomplete.key] ?? DEFAULT_RESUME_PATH
    );
  }

  return ONBOARDING_REVIEW_PATH;
}

export function isOnboardingPath(pathname: string): boolean {
  return pathname.startsWith("/onboarding");
}

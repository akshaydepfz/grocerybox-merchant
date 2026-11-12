import { SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT } from "../constants";
import type { OnboardingReview } from "../types/onboarding-review";

const SUBSCRIPTION_SECTION_KEY = "subscription_plan";

/** Whether the merchant may publish (client rules; may differ from API until backend skip is deployed). */
export function canPublishStore(
  review: OnboardingReview | null | undefined,
): boolean {
  if (!review || review.storePublished) {
    return false;
  }

  if (SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT) {
    return review.sections
      .filter((section) => section.key !== SUBSCRIPTION_SECTION_KEY)
      .every((section) => section.complete);
  }

  return review.readyToPublish;
}

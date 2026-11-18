import type { MerchantSubscriptionPayload } from "../types";

/** Plan slugs that include merchant delivery partner management (₹399 Growth, ₹599 Pro). */
const DELIVERY_BOY_MANAGEMENT_PLAN_SLUGS = new Set(["growth", "pro"]);

/** Retail monthly prices for Growth and Pro when slug is unavailable. */
const DELIVERY_BOY_MANAGEMENT_MONTHLY_PRICES = new Set([399, 599]);

function normalizePlanSlug(slug: string | null | undefined): string {
  return (slug ?? "").trim().toLowerCase();
}

/**
 * Delivery boy management is available on Growth and Pro only, not on the ₹199 Basic/Starter plan.
 */
export function merchantHasDeliveryBoyManagement(
  subscription: MerchantSubscriptionPayload | null | undefined,
): boolean {
  const plan = subscription?.plan;
  if (!plan) {
    return false;
  }

  const slug = normalizePlanSlug(plan.slug);
  if (slug.length > 0) {
    if (DELIVERY_BOY_MANAGEMENT_PLAN_SLUGS.has(slug)) {
      return true;
    }
    if (slug === "basic" || slug === "starter") {
      return false;
    }
  }

  if (plan.price != null && DELIVERY_BOY_MANAGEMENT_MONTHLY_PRICES.has(plan.price)) {
    return true;
  }

  if (plan.price === 199) {
    return false;
  }

  return false;
}
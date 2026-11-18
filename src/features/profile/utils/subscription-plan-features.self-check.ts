import type { MerchantSubscriptionPayload } from "../types";
import { merchantHasDeliveryBoyManagement } from "./subscription-plan-features";

function assert(condition: boolean, label: string): void {
  if (!condition) {
    throw new Error(`subscription-plan-features self-check failed: ${label}`);
  }
}

function sub(slug: string, price: number): MerchantSubscriptionPayload {
  return {
    subscriptionId: "sub_test",
    status: "active",
    startedAt: null,
    expiresAt: null,
    plan: {
      name: slug,
      slug,
      description: null,
      price,
      currency: "INR",
      billingInterval: "month",
      features: [],
    },
  };
}

assert(merchantHasDeliveryBoyManagement(sub("growth", 399)), "growth 399");
assert(merchantHasDeliveryBoyManagement(sub("pro", 599)), "pro 599");
assert(!merchantHasDeliveryBoyManagement(sub("starter", 199)), "starter 199");
assert(!merchantHasDeliveryBoyManagement(sub("basic", 199)), "basic 199");
assert(!merchantHasDeliveryBoyManagement(null), "no subscription");

console.log("subscription-plan-features self-check passed");
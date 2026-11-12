export type SubscriptionPlan = {
  planId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: string;
  features: string[];
  displayOrder: number;
};

export type SubscriptionPaymentOrder = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  paymentId: string;
};

export type MerchantSubscription = {
  subscriptionId: string;
  merchantId: string;
  planId: string;
  status: string;
  startedAt: string | null;
  expiresAt: string | null;
  planName: string | null;
  planSlug: string | null;
  planPrice: number | null;
};

export type VerifySubscriptionPaymentRequest = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

function readInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

export function subscriptionPlanFromJson(
  json: Record<string, unknown>,
): SubscriptionPlan {
  return {
    planId: json.plan_id != null ? String(json.plan_id) : "",
    name: (json.name as string) ?? "",
    slug: (json.slug as string) ?? "",
    description: (json.description as string) ?? "",
    price: readInt(json.price) ?? 0,
    currency: (json.currency as string) ?? "INR",
    billingInterval: (json.billing_interval as string) ?? "month",
    features: readStringList(json.features),
    displayOrder: readInt(json.display_order) ?? 0,
  };
}

export function subscriptionPaymentOrderFromJson(
  json: Record<string, unknown>,
): SubscriptionPaymentOrder {
  return {
    orderId: (json.order_id as string) ?? "",
    amount: readInt(json.amount) ?? 0,
    currency: (json.currency as string) ?? "INR",
    keyId: (json.key_id as string) ?? "",
    paymentId: json.payment_id != null ? String(json.payment_id) : "",
  };
}

function readDate(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  return null;
}

export function merchantSubscriptionFromJson(
  json: Record<string, unknown>,
): MerchantSubscription {
  const plan =
    json.plan && typeof json.plan === "object"
      ? (json.plan as Record<string, unknown>)
      : null;

  return {
    subscriptionId:
      json.subscription_id != null ? String(json.subscription_id) : "",
    merchantId: json.merchant_id != null ? String(json.merchant_id) : "",
    planId: json.plan_id != null ? String(json.plan_id) : "",
    status: (json.status as string) ?? "",
    startedAt: readDate(json.started_at),
    expiresAt: readDate(json.expires_at),
    planName: (plan?.name as string) ?? null,
    planSlug: (plan?.slug as string) ?? null,
    planPrice: plan ? readInt(plan.price) : null,
  };
}

export function isActiveSubscription(
  subscription: MerchantSubscription | null | undefined,
): boolean {
  return subscription?.status === "active";
}

export function verifyPaymentRequestToJson(
  request: VerifySubscriptionPaymentRequest,
): Record<string, string> {
  return {
    razorpay_order_id: request.razorpayOrderId,
    razorpay_payment_id: request.razorpayPaymentId,
    razorpay_signature: request.razorpaySignature,
  };
}

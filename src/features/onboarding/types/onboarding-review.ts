/** Mirrors Go `OnboardingSectionStatus` and `OnboardingReviewResponse`. */

export type OnboardingSectionStatus = {
  key: string;
  label: string;
  complete: boolean;
  missingFields: string[];
};

export type SubscriptionPublishStatus =
  | "missing"
  | "pending_payment"
  | "active"
  | "expired"
  | "cancelled"
  | "expired_by_date"
  | "invalid"
  | "unknown";

export type OnboardingReview = {
  merchantId: string;
  storeId: string | null;
  readyToPublish: boolean;
  storePublished: boolean;
  subscriptionPublishStatus: SubscriptionPublishStatus;
  sections: OnboardingSectionStatus[];
};

export type StorePublishResult = {
  storePublished: boolean;
  alreadyPublished: boolean;
  publishedAt: string | null;
};

export function parseSubscriptionPublishStatus(
  value: string | null | undefined,
): SubscriptionPublishStatus {
  switch (value) {
    case "missing":
      return "missing";
    case "pending_payment":
      return "pending_payment";
    case "active":
      return "active";
    case "expired":
      return "expired";
    case "cancelled":
      return "cancelled";
    case "expired_by_date":
      return "expired_by_date";
    case "invalid":
      return "invalid";
    default:
      return "unknown";
  }
}

export function onboardingSectionFromJson(
  json: Record<string, unknown>,
): OnboardingSectionStatus {
  const missing = json.missing_fields;
  return {
    key: (json.key as string) ?? "",
    label: (json.label as string) ?? "",
    complete: (json.complete as boolean) ?? false,
    missingFields:
      missing instanceof Array
        ? missing.map((item) => String(item))
        : [],
  };
}

export function onboardingReviewFromEnvelopeData(
  data: Record<string, unknown>,
): OnboardingReview {
  const sectionsRaw = data.sections;
  return {
    merchantId: data.merchant_id != null ? String(data.merchant_id) : "",
    storeId:
      data.store_id != null && data.store_id !== ""
        ? String(data.store_id)
        : null,
    readyToPublish: (data.ready_to_publish as boolean) ?? false,
    storePublished: (data.store_published as boolean) ?? false,
    subscriptionPublishStatus: parseSubscriptionPublishStatus(
      data.subscription_publish_status as string | undefined,
    ),
    sections:
      sectionsRaw instanceof Array
        ? sectionsRaw
            .filter(
              (item): item is Record<string, unknown> =>
                item != null && typeof item === "object",
            )
            .map((item) => onboardingSectionFromJson(item))
        : [],
  };
}

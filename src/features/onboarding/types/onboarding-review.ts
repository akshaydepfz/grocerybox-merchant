/** Mirrors Go `OnboardingSectionStatus` and `OnboardingReviewResponse`. */

export type OnboardingSectionStatus = {
  key: string;
  label: string;
  complete: boolean;
  missingFields: string[];
};

export type OnboardingReview = {
  merchantId: string;
  storeId: string | null;
  readyToPublish: boolean;
  storePublished: boolean;
  subscriptionPublishStatus: string;
  sections: OnboardingSectionStatus[];
};

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
    subscriptionPublishStatus:
      (data.subscription_publish_status as string) ?? "",
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

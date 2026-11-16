import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  onboardingReviewFromEnvelopeData,
  type OnboardingReview,
  type StorePublishOptions,
  type StorePublishResult,
} from "../types/onboarding-review";

function storePublishFromEnvelopeData(
  data: Record<string, unknown>,
): StorePublishResult {
  return {
    storePublished: (data.store_published as boolean) ?? false,
    alreadyPublished: (data.already_published as boolean) ?? false,
    publishedAt:
      typeof data.published_at === "string" && data.published_at.length > 0
        ? data.published_at
        : null,
    masterCatalogImported: (data.master_catalog_imported as boolean) ?? false,
  };
}

export async function fetchOnboardingReview(): Promise<OnboardingReview> {
  const response = await apiClient.get(API_ENDPOINTS.merchantOnboardingReview);
  if (response.status === 200) {
    const envelope = parseApiEnvelope(response.data);
    if (!envelope.success || typeof envelope.data !== "object") {
      throw new ApiError(
        envelopeErrorMessage(response.status, envelope),
        response.status,
      );
    }
    return onboardingReviewFromEnvelopeData(
      envelope.data as Record<string, unknown>,
    );
  }
  const envelope = parseApiEnvelope(response.data);
  throw new ApiError(
    envelopeErrorMessage(response.status, envelope),
    response.status,
  );
}

export async function publishStore(
  options: StorePublishOptions,
): Promise<StorePublishResult> {
  const response = await apiClient.post(API_ENDPOINTS.merchantStorePublish, {
    catalog_setup: options.catalogSetup,
  });
  if (response.status === 200) {
    const envelope = parseApiEnvelope(response.data);
    if (!envelope.success || typeof envelope.data !== "object") {
      throw new ApiError(
        envelopeErrorMessage(response.status, envelope),
        response.status,
      );
    }
    return storePublishFromEnvelopeData(
      envelope.data as Record<string, unknown>,
    );
  }
  const envelope = parseApiEnvelope(response.data);
  throw new ApiError(
    envelopeErrorMessage(response.status, envelope),
    response.status,
  );
}

import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  onboardingReviewFromEnvelopeData,
  type OnboardingReview,
} from "../types/onboarding-review";

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

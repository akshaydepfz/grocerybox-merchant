import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  slugAvailabilityFromEnvelopeData,
  storeIdentityFromEnvelopeData,
  storeIdentityToJson,
  type SlugAvailabilityData,
  type StoreIdentityData,
  type StoreIdentityFormValues,
} from "../types/store-identity";

export async function fetchStore(): Promise<StoreIdentityData | null> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.merchantStore);
    if (response.status === 200) {
      const envelope = parseApiEnvelope(response.data);
      if (!envelope.success || typeof envelope.data !== "object") {
        throw new ApiError(
          envelopeErrorMessage(response.status, envelope),
          response.status,
        );
      }
      return storeIdentityFromEnvelopeData(
        envelope.data as Record<string, unknown>,
      );
    }
    throw new ApiError(
      envelopeErrorMessage(response.status, parseApiEnvelope(response.data)),
      response.status,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createStore(
  values: StoreIdentityFormValues,
): Promise<void> {
  const response = await apiClient.post(
    API_ENDPOINTS.merchantStore,
    storeIdentityToJson(values),
  );
  if (response.status === 201) {
    return;
  }
  const envelope = parseApiEnvelope(response.data);
  throw new ApiError(
    envelopeErrorMessage(response.status, envelope),
    response.status,
  );
}

export async function updateStore(
  values: StoreIdentityFormValues,
): Promise<void> {
  const response = await apiClient.put(
    API_ENDPOINTS.merchantStore,
    storeIdentityToJson(values),
  );
  if (response.status === 200) {
    return;
  }
  const envelope = parseApiEnvelope(response.data);
  throw new ApiError(
    envelopeErrorMessage(response.status, envelope),
    response.status,
  );
}

export async function checkSlugAvailability(
  slug: string,
): Promise<SlugAvailabilityData> {
  const response = await apiClient.get(API_ENDPOINTS.merchantStoreCheckSlug, {
    params: { slug },
  });
  if (response.status === 200) {
    const envelope = parseApiEnvelope(response.data);
    if (!envelope.success || typeof envelope.data !== "object") {
      throw new ApiError(
        envelopeErrorMessage(response.status, envelope),
        response.status,
      );
    }
    return slugAvailabilityFromEnvelopeData(
      envelope.data as Record<string, unknown>,
    );
  }
  const envelope = parseApiEnvelope(response.data);
  throw new ApiError(
    envelopeErrorMessage(response.status, envelope),
    response.status,
  );
}

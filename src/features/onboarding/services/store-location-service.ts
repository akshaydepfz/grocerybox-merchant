import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  storeLocationFromEnvelopeData,
  storeLocationToJson,
  type StoreLocationData,
  type StoreLocationFormValues,
} from "../types/store-location";

export async function fetchStoreLocation(): Promise<StoreLocationData | null> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.merchantStoreLocation);
    if (response.status === 200) {
      const envelope = parseApiEnvelope(response.data);
      if (!envelope.success || typeof envelope.data !== "object") {
        throw new ApiError(
          envelopeErrorMessage(response.status, envelope),
          response.status,
        );
      }
      return storeLocationFromEnvelopeData(
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

export async function saveStoreLocation(
  values: StoreLocationFormValues,
): Promise<StoreLocationData> {
  const response = await apiClient.put(
    API_ENDPOINTS.merchantStoreLocation,
    storeLocationToJson(values),
  );
  if (response.status === 200) {
    const envelope = parseApiEnvelope(response.data);
    if (!envelope.success || typeof envelope.data !== "object") {
      throw new ApiError(
        envelopeErrorMessage(response.status, envelope),
        response.status,
      );
    }
    return storeLocationFromEnvelopeData(
      envelope.data as Record<string, unknown>,
    );
  }
  const envelope = parseApiEnvelope(response.data);
  throw new ApiError(
    envelopeErrorMessage(response.status, envelope),
    response.status,
  );
}

import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  storeConfigFromEnvelopeData,
  storeConfigToJson,
  type StoreConfigData,
  type StoreConfigFormValues,
} from "../types/store-config";

export async function fetchStoreConfig(): Promise<StoreConfigData> {
  const response = await apiClient.get(API_ENDPOINTS.merchantStoreConfig);
  if (response.status === 200) {
    const envelope = parseApiEnvelope(response.data);
    if (!envelope.success || typeof envelope.data !== "object") {
      throw new ApiError(
        envelopeErrorMessage(response.status, envelope),
        response.status,
      );
    }
    return storeConfigFromEnvelopeData(
      envelope.data as Record<string, unknown>,
    );
  }
  const envelope = parseApiEnvelope(response.data);
  throw new ApiError(
    envelopeErrorMessage(response.status, envelope),
    response.status,
  );
}

export async function saveStoreConfig(
  values: StoreConfigFormValues,
): Promise<StoreConfigData> {
  const response = await apiClient.put(
    API_ENDPOINTS.merchantStoreConfig,
    storeConfigToJson(values),
  );
  if (response.status === 200) {
    const envelope = parseApiEnvelope(response.data);
    if (!envelope.success || typeof envelope.data !== "object") {
      throw new ApiError(
        envelopeErrorMessage(response.status, envelope),
        response.status,
      );
    }
    return storeConfigFromEnvelopeData(
      envelope.data as Record<string, unknown>,
    );
  }
  const envelope = parseApiEnvelope(response.data);
  throw new ApiError(
    envelopeErrorMessage(response.status, envelope),
    response.status,
  );
}

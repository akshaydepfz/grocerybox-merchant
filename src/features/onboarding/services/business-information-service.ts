import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  businessInformationFromEnvelopeData,
  businessInformationToJson,
  type BusinessInformationData,
  type BusinessInformationFormValues,
} from "../types/business-information";

export async function fetchBusiness(): Promise<BusinessInformationData | null> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.merchantBusiness);
    if (response.status === 200) {
      const envelope = parseApiEnvelope(response.data);
      if (!envelope.success || typeof envelope.data !== "object") {
        throw new ApiError(
          envelopeErrorMessage(response.status, envelope),
          response.status,
        );
      }
      return businessInformationFromEnvelopeData(
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

async function updateBusiness(
  values: BusinessInformationFormValues,
): Promise<void> {
  const response = await apiClient.put(
    API_ENDPOINTS.merchantBusiness,
    businessInformationToJson(values),
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

/** Saves business information, creating or updating as needed (Flutter parity). */
export async function saveBusiness(
  values: BusinessInformationFormValues,
): Promise<void> {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.merchantBusiness,
      businessInformationToJson(values),
    );
    if (response.status === 201) {
      return;
    }
    const envelope = parseApiEnvelope(response.data);
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      await updateBusiness(values);
      return;
    }
    throw error;
  }
}

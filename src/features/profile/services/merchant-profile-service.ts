import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  merchantProfileFromEnvelopeData,
  merchantProfileNameUpdateToJson,
  type MerchantProfile,
  type MerchantProfileNameUpdateInput,
} from "../types";

function assertProfilePayload(data: unknown, status: number): MerchantProfile {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(
      envelopeErrorMessage(status, envelope, "Unable to load merchant profile."),
      status,
    );
  }
  return merchantProfileFromEnvelopeData(envelope.data);
}

export async function getMerchantProfile(): Promise<MerchantProfile> {
  const response = await apiClient.get(API_ENDPOINTS.merchantProfile);
  return assertProfilePayload(response.data, response.status);
}

export async function registerOrRetrieveMerchantProfile(): Promise<MerchantProfile> {
  try {
    return await getMerchantProfile();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      const registerResponse = await apiClient.post(
        API_ENDPOINTS.merchantRegister,
      );
      const envelope = parseApiEnvelope(registerResponse.data);
      if (!envelope.success) {
        throw new ApiError(
          envelopeErrorMessage(
            registerResponse.status,
            envelope,
            "Unable to register merchant.",
          ),
          registerResponse.status,
        );
      }
      if (envelope.data && typeof envelope.data === "object") {
        return merchantProfileFromEnvelopeData(envelope.data);
      }
      return getMerchantProfile();
    }
    throw error;
  }
}

export async function updateMerchantAccountName(
  input: MerchantProfileNameUpdateInput,
): Promise<MerchantProfile> {
  const response = await apiClient.put(
    API_ENDPOINTS.merchantProfile,
    merchantProfileNameUpdateToJson(input),
  );
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success) {
    throw new ApiError(
      envelopeErrorMessage(
        response.status,
        envelope,
        "Unable to update your name.",
      ),
      response.status,
    );
  }
  return getMerchantProfile();
}

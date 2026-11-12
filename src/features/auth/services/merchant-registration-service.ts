import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { createApiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import { getIdToken } from "./auth-service";

/**
 * POST /api/v1/merchant/register with Bearer auth and no body (Flutter parity).
 */
export async function registerMerchant(): Promise<void> {
  const client = createApiClient({
    getAuthorizationHeader: async () => {
      const token = await getIdToken(true);
      return `Bearer ${token}`;
    },
  });

  try {
    const response = await client.post(API_ENDPOINTS.merchantRegister);
    const envelope = parseApiEnvelope(response.data);
    if (envelope.success) {
      return;
    }
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status > 0) {
      throw error;
    }
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      "data" in error.response
    ) {
      const response = error.response as { status: number; data: unknown };
      const envelope = parseApiEnvelope(response.data);
      throw new ApiError(
        envelopeErrorMessage(response.status, envelope),
        response.status,
      );
    }
    throw error;
  }
}

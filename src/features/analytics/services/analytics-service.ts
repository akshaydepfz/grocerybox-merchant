import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  merchantAnalyticsFromJson,
  type MerchantAnalyticsPeriod,
  type MerchantAnalyticsReport,
} from "../types/merchant-analytics";

export async function getMerchantAnalytics(
  period: MerchantAnalyticsPeriod = "30d",
): Promise<MerchantAnalyticsReport> {
  const response = await apiClient.get(API_ENDPOINTS.merchantAnalytics, {
    params: { period },
  });
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(response.status, envelope), response.status);
  }
  return merchantAnalyticsFromJson(envelope.data as Record<string, unknown>);
}

export function friendlyAnalyticsError(error: ApiError): string {
  if (error.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (error.status === 400) {
    return error.message.length > 0 ? error.message : "Invalid analytics request.";
  }
  return error.message.length > 0
    ? error.message
    : "Unable to load analytics.";
}
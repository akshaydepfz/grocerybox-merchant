import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  parseCustomerListData,
  type MerchantCustomerListParams,
  type MerchantCustomerListResult,
} from "../types/merchant-customer";

export async function listMerchantCustomers(
  params: MerchantCustomerListParams = {},
): Promise<MerchantCustomerListResult> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  if (params.search?.trim()) {
    query.search = params.search.trim();
  }

  const response = await apiClient.get(API_ENDPOINTS.merchantCustomers, { params: query });
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(response.status, envelope), response.status);
  }
  return parseCustomerListData(envelope.data);
}

export function friendlyCustomerError(error: ApiError): string {
  if (error.status === 503) {
    return error.message.length > 0
      ? error.message
      : "Customers are not available yet. Contact support if this persists.";
  }
  if (error.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (error.status === 400) {
    return error.message.length > 0 ? error.message : "Invalid customer list request.";
  }
  return error.message.length > 0 ? error.message : "Unable to load customers.";
}
import {
  API_ENDPOINTS,
  merchantDeliveryBoyPath,
} from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  deliveryBoyCreateToJson,
  deliveryBoySummaryFromJson,
  deliveryBoyUpdateToJson,
  merchantDeliveryBoyFromJson,
  parseDeliveryBoyListData,
  type MerchantDeliveryBoy,
  type MerchantDeliveryBoyCreateInput,
  type MerchantDeliveryBoyListParams,
  type MerchantDeliveryBoyListResult,
  type MerchantDeliveryBoySummary,
  type MerchantDeliveryBoyUpdateInput,
} from "../types/merchant-delivery-boy";

function assertDeliveryBoyPayload(
  data: unknown,
  status: number,
): MerchantDeliveryBoy {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return merchantDeliveryBoyFromJson(envelope.data as Record<string, unknown>);
}

function assertListPayload(
  data: unknown,
  status: number,
): MerchantDeliveryBoyListResult {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return parseDeliveryBoyListData(envelope.data);
}

export async function listMerchantDeliveryBoys(
  params: MerchantDeliveryBoyListParams = {},
): Promise<MerchantDeliveryBoyListResult> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 50,
  };
  if (params.search?.trim()) {
    query.search = params.search.trim();
  }
  if (params.status && params.status !== "all") {
    query.status = params.status;
  }

  const response = await apiClient.get(API_ENDPOINTS.merchantDeliveryBoys, {
    params: query,
  });
  return assertListPayload(response.data, response.status);
}

export async function getMerchantDeliveryBoySummary(): Promise<MerchantDeliveryBoySummary> {
  const response = await apiClient.get(API_ENDPOINTS.merchantDeliveryBoysSummary);
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(response.status, envelope), response.status);
  }
  return deliveryBoySummaryFromJson(envelope.data as Record<string, unknown>);
}

export async function getMerchantDeliveryBoy(
  id: string,
): Promise<MerchantDeliveryBoy> {
  const response = await apiClient.get(merchantDeliveryBoyPath(id));
  return assertDeliveryBoyPayload(response.data, response.status);
}

export async function createMerchantDeliveryBoy(
  input: MerchantDeliveryBoyCreateInput,
): Promise<MerchantDeliveryBoy> {
  const response = await apiClient.post(
    API_ENDPOINTS.merchantDeliveryBoys,
    deliveryBoyCreateToJson(input),
  );
  return assertDeliveryBoyPayload(response.data, response.status);
}

export async function updateMerchantDeliveryBoy(
  id: string,
  input: MerchantDeliveryBoyUpdateInput,
): Promise<MerchantDeliveryBoy> {
  const response = await apiClient.put(
    merchantDeliveryBoyPath(id),
    deliveryBoyUpdateToJson(input),
  );
  return assertDeliveryBoyPayload(response.data, response.status);
}

export async function deleteMerchantDeliveryBoy(id: string): Promise<void> {
  const response = await apiClient.delete(merchantDeliveryBoyPath(id));
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(response.status, envelope), response.status);
  }
}

export function friendlyDeliveryBoyError(error: ApiError): string {
  if (error.status === 409) {
    return error.message.length > 0
      ? error.message
      : "This phone number is already registered.";
  }
  if (error.status === 404) {
    return error.message.length > 0 ? error.message : "Delivery partner not found.";
  }
  if (error.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (error.status === 400) {
    return error.message.length > 0 ? error.message : "Invalid request.";
  }
  return error.message.length > 0
    ? error.message
    : "Unable to process delivery partner request.";
}
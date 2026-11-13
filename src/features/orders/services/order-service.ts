import {
  API_ENDPOINTS,
  merchantOrderCancelPath,
  merchantOrderPath,
  merchantOrderStatusPath,
} from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  merchantOrderDetailFromJson,
  orderStatusUpdateToJson,
  parseOrderListData,
  type MerchantOrderDetail,
  type MerchantOrderListParams,
  type MerchantOrderListResult,
  type MerchantOrderTimelineStep,
} from "../types/merchant-order";

function assertOrderDetail(data: unknown, status: number): MerchantOrderDetail {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return merchantOrderDetailFromJson(envelope.data as Record<string, unknown>);
}

export async function listMerchantOrders(
  params: MerchantOrderListParams = {},
): Promise<MerchantOrderListResult> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  if (params.search?.trim()) {
    query.search = params.search.trim();
  }
  if (params.currentStep) {
    query.current_step = params.currentStep;
  }
  if (params.paymentStatus) {
    query.payment_status = params.paymentStatus;
  }

  const response = await apiClient.get(API_ENDPOINTS.merchantOrders, { params: query });
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(response.status, envelope), response.status);
  }
  return parseOrderListData(envelope.data);
}

export async function getMerchantOrder(id: string): Promise<MerchantOrderDetail> {
  const response = await apiClient.get(merchantOrderPath(id));
  return assertOrderDetail(response.data, response.status);
}

export async function updateMerchantOrderStatus(
  id: string,
  currentStep: MerchantOrderTimelineStep,
): Promise<MerchantOrderDetail> {
  const response = await apiClient.patch(
    merchantOrderStatusPath(id),
    orderStatusUpdateToJson(currentStep),
  );
  return assertOrderDetail(response.data, response.status);
}

export async function cancelMerchantOrder(id: string): Promise<MerchantOrderDetail> {
  const response = await apiClient.post(merchantOrderCancelPath(id));
  return assertOrderDetail(response.data, response.status);
}

export function friendlyOrderError(error: ApiError): string {
  if (error.status === 404) {
    return error.message.length > 0 ? error.message : "Order not found.";
  }
  if (error.status === 503) {
    return error.message.length > 0
      ? error.message
      : "Orders are not available yet. Contact support if this persists.";
  }
  if (error.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (error.status === 400) {
    return error.message.length > 0 ? error.message : "Invalid order request.";
  }
  if (error.status === 409) {
    return error.message.length > 0
      ? error.message
      : "This order cannot be updated in its current state.";
  }
  return error.message.length > 0 ? error.message : "Unable to process order request.";
}

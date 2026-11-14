import {
  API_ENDPOINTS,
  merchantCouponPath,
} from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  couponCreateToJson,
  merchantCouponFromJson,
  parseCouponListData,
  type MerchantCoupon,
  type MerchantCouponDraft,
  type MerchantCouponListParams,
  type MerchantCouponListResult,
} from "../types/merchant-coupon";

function assertCouponPayload(data: unknown, status: number): MerchantCoupon {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return merchantCouponFromJson(envelope.data as Record<string, unknown>);
}

function assertListPayload(
  data: unknown,
  status: number,
): MerchantCouponListResult {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return parseCouponListData(envelope.data);
}

export async function listMerchantCoupons(
  params: MerchantCouponListParams = {},
): Promise<MerchantCouponListResult> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: params.limit ?? 100,
  };
  if (params.search?.trim()) {
    query.search = params.search.trim();
  }
  if (params.isActive != null) {
    query.is_active = params.isActive;
  }

  const response = await apiClient.get(API_ENDPOINTS.merchantCoupons, {
    params: query,
  });
  return assertListPayload(response.data, response.status);
}

export async function createMerchantCoupon(
  input: MerchantCouponDraft,
): Promise<MerchantCoupon> {
  const response = await apiClient.post(
    API_ENDPOINTS.merchantCoupons,
    couponCreateToJson(input),
  );
  return assertCouponPayload(response.data, response.status);
}

export async function deleteMerchantCoupon(id: string): Promise<void> {
  const response = await apiClient.delete(merchantCouponPath(id));
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(response.status, envelope), response.status);
  }
}

export async function activateMerchantCoupon(id: string): Promise<MerchantCoupon> {
  const response = await apiClient.patch(merchantCouponPath(id, "activate"));
  return assertCouponPayload(response.data, response.status);
}

export async function deactivateMerchantCoupon(id: string): Promise<MerchantCoupon> {
  const response = await apiClient.patch(merchantCouponPath(id, "deactivate"));
  return assertCouponPayload(response.data, response.status);
}

export function friendlyCouponError(error: ApiError): string {
  if (error.status === 409) {
    return error.message.length > 0
      ? error.message
      : "This coupon code is already in use.";
  }
  if (error.status === 404) {
    return error.message.length > 0 ? error.message : "Coupon not found.";
  }
  if (error.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (error.status === 400) {
    return error.message.length > 0 ? error.message : "Invalid coupon request.";
  }
  return error.message.length > 0
    ? error.message
    : "Unable to process coupon request.";
}
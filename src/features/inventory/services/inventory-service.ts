import {
  API_ENDPOINTS,
  merchantProductPath,
} from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";
import {
  merchantProductFromJson,
  type MerchantProduct,
} from "@/features/products/types/merchant-product";

import {
  merchantInventorySummaryFromJson,
  type MerchantInventorySummary,
} from "../types/merchant-inventory";

export async function getMerchantInventorySummary(): Promise<MerchantInventorySummary> {
  const response = await apiClient.get(API_ENDPOINTS.merchantInventorySummary);
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(response.status, envelope), response.status);
  }
  return merchantInventorySummaryFromJson(
    envelope.data as Record<string, unknown>,
  );
}

export async function patchMerchantProductStock(
  productId: string,
  stockQuantity: number,
): Promise<MerchantProduct> {
  const response = await apiClient.patch(merchantProductPath(productId, "stock"), {
    stock_quantity: stockQuantity,
  });
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(response.status, envelope), response.status);
  }
  return merchantProductFromJson(envelope.data as Record<string, unknown>);
}

export function friendlyInventoryError(error: ApiError): string {
  if (error.status === 404) {
    return error.message.length > 0 ? error.message : "Product not found.";
  }
  if (error.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (error.status === 400) {
    return error.message.length > 0 ? error.message : "Invalid stock quantity.";
  }
  return error.message.length > 0
    ? error.message
    : "Unable to process inventory request.";
}
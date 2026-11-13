import { API_ENDPOINTS, merchantProductPath } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  merchantProductFromJson,
  parseProductListData,
  type MerchantProduct,
  type MerchantProductListParams,
  type MerchantProductListResult,
} from "../types/merchant-product";

function assertProductPayload(data: unknown, status: number): MerchantProduct {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return merchantProductFromJson(envelope.data as Record<string, unknown>);
}

function assertListPayload(
  data: unknown,
  status: number,
): MerchantProductListResult {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return parseProductListData(envelope.data);
}

export async function listMerchantProducts(
  params: MerchantProductListParams = {},
): Promise<MerchantProductListResult> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };

  if (params.search?.trim()) {
    query.search = params.search.trim();
  }
  if (params.categoryId?.trim()) {
    query.category_id = params.categoryId.trim();
  }
  if (params.subcategoryId?.trim()) {
    query.subcategory_id = params.subcategoryId.trim();
  }
  if (params.isActive != null) {
    query.is_active = params.isActive;
  }
  if (params.isFeatured != null) {
    query.is_featured = params.isFeatured;
  }
  if (params.stockStatus) {
    query.stock_status = params.stockStatus;
  }
  if (params.sortBy) {
    query.sort_by = params.sortBy;
  }
  if (params.sortOrder) {
    query.sort_order = params.sortOrder;
  }

  const response = await apiClient.get(API_ENDPOINTS.merchantProducts, {
    params: query,
  });
  return assertListPayload(response.data, response.status);
}

export async function getMerchantProduct(id: string): Promise<MerchantProduct> {
  const response = await apiClient.get(merchantProductPath(id));
  return assertProductPayload(response.data, response.status);
}

export function friendlyProductError(error: ApiError): string {
  if (error.status === 404) {
    return error.message.length > 0 ? error.message : "Product not found.";
  }
  if (error.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (error.status === 400) {
    return error.message.length > 0 ? error.message : "Invalid product request.";
  }
  return error.message.length > 0
    ? error.message
    : "Unable to process product request.";
}

import {
  API_ENDPOINTS,
  merchantCategoryPath,
} from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  categoryCreateToJson,
  categoryUpdateToJson,
  merchantCategoryFromJson,
  parseCategoryListData,
  type MerchantCategory,
  type MerchantCategoryCreateInput,
  type MerchantCategoryListParams,
  type MerchantCategoryListResult,
  type MerchantCategoryUpdateInput,
} from "../types/merchant-category";

function assertCategoryPayload(
  data: unknown,
  status: number,
): MerchantCategory {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return merchantCategoryFromJson(envelope.data as Record<string, unknown>);
}

function assertListPayload(data: unknown, status: number): MerchantCategoryListResult {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return parseCategoryListData(envelope.data);
}

export async function listMerchantCategories(
  params: MerchantCategoryListParams = {},
): Promise<MerchantCategoryListResult> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };
  if (params.search?.trim()) {
    query.search = params.search.trim();
  }
  if (params.isActive != null) {
    query.is_active = params.isActive;
  }

  const response = await apiClient.get(API_ENDPOINTS.merchantCategories, {
    params: query,
  });
  return assertListPayload(response.data, response.status);
}

export async function getMerchantCategory(id: string): Promise<MerchantCategory> {
  const response = await apiClient.get(merchantCategoryPath(id));
  return assertCategoryPayload(response.data, response.status);
}

export async function createMerchantCategory(
  input: MerchantCategoryCreateInput,
): Promise<MerchantCategory> {
  const response = await apiClient.post(
    API_ENDPOINTS.merchantCategories,
    categoryCreateToJson(input),
  );
  return assertCategoryPayload(response.data, response.status);
}

export async function updateMerchantCategory(
  id: string,
  input: MerchantCategoryUpdateInput,
): Promise<MerchantCategory> {
  const response = await apiClient.put(
    merchantCategoryPath(id),
    categoryUpdateToJson(input),
  );
  return assertCategoryPayload(response.data, response.status);
}

export async function activateMerchantCategory(id: string): Promise<MerchantCategory> {
  const response = await apiClient.patch(merchantCategoryPath(id, "activate"));
  return assertCategoryPayload(response.data, response.status);
}

export async function deactivateMerchantCategory(
  id: string,
): Promise<MerchantCategory> {
  const response = await apiClient.patch(merchantCategoryPath(id, "deactivate"));
  return assertCategoryPayload(response.data, response.status);
}

export async function deleteMerchantCategory(id: string): Promise<void> {
  const response = await apiClient.delete(merchantCategoryPath(id));
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(response.status, envelope), response.status);
  }
}

export function friendlyCategoryError(error: ApiError): string {
  if (error.status === 409) {
    return error.message.length > 0
      ? error.message
      : "This category conflicts with an existing record.";
  }
  if (error.status === 404) {
    return error.message.length > 0 ? error.message : "Category not found.";
  }
  if (error.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  return error.message.length > 0
    ? error.message
    : "Unable to process category request.";
}

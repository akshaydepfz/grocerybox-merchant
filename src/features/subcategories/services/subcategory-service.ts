import {
  merchantSubcategoriesPath,
  merchantSubcategoryPath,
} from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  merchantSubcategoryFromJson,
  parseSubcategoryListData,
  subcategoryCreateToJson,
  subcategoryUpdateToJson,
  type CreateMerchantSubcategoryRequest,
  type MerchantSubcategory,
  type MerchantSubcategoryListParams,
  type MerchantSubcategoryListResult,
  type UpdateMerchantSubcategoryRequest,
} from "../types/merchant-subcategory";

function assertSubcategoryPayload(
  data: unknown,
  status: number,
): MerchantSubcategory {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return merchantSubcategoryFromJson(envelope.data as Record<string, unknown>);
}

function assertListPayload(
  data: unknown,
  status: number,
): MerchantSubcategoryListResult {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return parseSubcategoryListData(envelope.data);
}

export async function listMerchantSubcategories(
  categoryId: string,
  params: MerchantSubcategoryListParams = {},
): Promise<MerchantSubcategoryListResult> {
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

  const response = await apiClient.get(merchantSubcategoriesPath(categoryId), {
    params: query,
  });
  return assertListPayload(response.data, response.status);
}

export async function getMerchantSubcategory(
  categoryId: string,
  subcategoryId: string,
): Promise<MerchantSubcategory> {
  const response = await apiClient.get(
    merchantSubcategoryPath(categoryId, subcategoryId),
  );
  return assertSubcategoryPayload(response.data, response.status);
}

export async function createMerchantSubcategory(
  categoryId: string,
  input: CreateMerchantSubcategoryRequest,
): Promise<MerchantSubcategory> {
  const response = await apiClient.post(
    merchantSubcategoriesPath(categoryId),
    subcategoryCreateToJson(input),
  );
  return assertSubcategoryPayload(response.data, response.status);
}

export async function updateMerchantSubcategory(
  categoryId: string,
  subcategoryId: string,
  input: UpdateMerchantSubcategoryRequest,
): Promise<MerchantSubcategory> {
  const response = await apiClient.put(
    merchantSubcategoryPath(categoryId, subcategoryId),
    subcategoryUpdateToJson(input),
  );
  return assertSubcategoryPayload(response.data, response.status);
}

export async function activateMerchantSubcategory(
  categoryId: string,
  subcategoryId: string,
): Promise<MerchantSubcategory> {
  const response = await apiClient.patch(
    merchantSubcategoryPath(categoryId, subcategoryId, "activate"),
  );
  return assertSubcategoryPayload(response.data, response.status);
}

export async function deactivateMerchantSubcategory(
  categoryId: string,
  subcategoryId: string,
): Promise<MerchantSubcategory> {
  const response = await apiClient.patch(
    merchantSubcategoryPath(categoryId, subcategoryId, "deactivate"),
  );
  return assertSubcategoryPayload(response.data, response.status);
}

export async function deleteMerchantSubcategory(
  categoryId: string,
  subcategoryId: string,
): Promise<void> {
  const response = await apiClient.delete(
    merchantSubcategoryPath(categoryId, subcategoryId),
  );
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success) {
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }
}

export function friendlySubcategoryError(error: ApiError): string {
  if (error.status === 409) {
    return error.message.length > 0
      ? error.message
      : "This subcategory conflicts with an existing record.";
  }
  if (error.status === 404) {
    return error.message.length > 0 ? error.message : "Subcategory not found.";
  }
  if (error.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  return error.message.length > 0
    ? error.message
    : "Unable to process subcategory request.";
}

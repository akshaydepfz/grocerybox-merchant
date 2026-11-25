import {
  API_ENDPOINTS,
  merchantDomainPath,
} from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  domainCreateToJson,
  merchantDomainFromJson,
  parseMerchantDomainListData,
  type MerchantDomain,
  type MerchantDomainCreateInput,
} from "../types/merchant-domain";

function assertDomainPayload(data: unknown, status: number): MerchantDomain {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return merchantDomainFromJson(envelope.data as Record<string, unknown>);
}

function assertListPayload(data: unknown, status: number): MerchantDomain[] {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success) {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return parseMerchantDomainListData(envelope.data);
}

export async function listMerchantDomains(): Promise<MerchantDomain[]> {
  const response = await apiClient.get(API_ENDPOINTS.merchantDomains);
  return assertListPayload(response.data, response.status);
}

export async function getMerchantDomain(id: string): Promise<MerchantDomain> {
  const response = await apiClient.get(merchantDomainPath(id));
  return assertDomainPayload(response.data, response.status);
}

export async function createMerchantDomain(
  input: MerchantDomainCreateInput,
): Promise<MerchantDomain> {
  const response = await apiClient.post(
    API_ENDPOINTS.merchantDomains,
    domainCreateToJson(input),
  );
  return assertDomainPayload(response.data, response.status);
}

export async function verifyMerchantDomain(id: string): Promise<MerchantDomain> {
  const response = await apiClient.post(merchantDomainPath(id, "verify"));
  return assertDomainPayload(response.data, response.status);
}

export async function deleteMerchantDomain(id: string): Promise<void> {
  const response = await apiClient.delete(merchantDomainPath(id));
  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success) {
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }
}

export function friendlyDomainError(error: ApiError): string {
  if (error.status === 409) {
    return error.message.length > 0
      ? error.message
      : "This domain is already registered for your store.";
  }
  if (error.status === 400) {
    return error.message.length > 0
      ? error.message
      : "Invalid domain. Check the hostname and try again.";
  }
  if (error.status === 404) {
    return error.message.length > 0 ? error.message : "Domain not found.";
  }
  if (error.status === 401) {
    return "Your session expired. Please sign in again.";
  }
  if (error.status === 429) {
    return error.message.length > 0
      ? error.message
      : "Too many requests. Wait a moment and try again.";
  }
  return error.message.length > 0
    ? error.message
    : "Unable to process domain request.";
}

export function friendlyDomainVerifyError(error: ApiError): string {
  if (error.status === 422) {
    return "DNS verification record not found or does not match. Please check your TXT record and try again.";
  }
  return friendlyDomainError(error);
}
/**
 * REST path registry (paths relative to Flutter `ApiConfig.baseUrl`).
 *
 * Full URL example: `https://api.openmystore.in` + `API_ENDPOINTS.merchantRegister`
 */
import { API_V1_PREFIX } from "@/config/api-config";

export const apiPath = (...segments: string[]): string => {
  const normalized = segments
    .map((segment) => segment.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
  return `/${normalized.join("/")}`;
};

/**
 * Endpoint map — populate during API integration from Flutter reference.
 */
/** Paths match Flutter services (`${ApiConfig.apiV1Prefix}/…`). */
export const API_ENDPOINTS = {
  merchantRegister: `${API_V1_PREFIX}/merchant/register`,
  merchantBusiness: `${API_V1_PREFIX}/merchant/business`,
  merchantStore: `${API_V1_PREFIX}/merchant/store`,
  merchantStoreCheckSlug: `${API_V1_PREFIX}/merchant/store/check-slug`,
  merchantStoreBranding: `${API_V1_PREFIX}/merchant/store/branding`,
  merchantStoreBrandingLogo: `${API_V1_PREFIX}/merchant/store/branding/logo`,
  merchantStoreBrandingBanner: `${API_V1_PREFIX}/merchant/store/branding/banner`,
  merchantStoreLocation: `${API_V1_PREFIX}/merchant/store/location`,
  merchantOnboardingReview: `${API_V1_PREFIX}/merchant/onboarding/review`,
} as const satisfies Record<string, string>;

export type ApiEndpointKey = keyof typeof API_ENDPOINTS;

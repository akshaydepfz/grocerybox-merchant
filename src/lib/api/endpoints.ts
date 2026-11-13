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
  merchantStorePublish: `${API_V1_PREFIX}/merchant/store/publish`,
  merchantStoreConfig: `${API_V1_PREFIX}/merchant/store/config`,
  subscriptionPlans: `${API_V1_PREFIX}/subscription/plans`,
  merchantSubscription: `${API_V1_PREFIX}/merchant/subscription`,
  merchantSubscriptionSelect: `${API_V1_PREFIX}/merchant/subscription/select`,
  merchantSubscriptionPaymentOrder: `${API_V1_PREFIX}/merchant/subscription/payment/order`,
  merchantSubscriptionPaymentVerify: `${API_V1_PREFIX}/merchant/subscription/payment/verify`,
  merchantCategories: `${API_V1_PREFIX}/merchant/categories`,
} as const satisfies Record<string, string>;

export function merchantCategoryPath(
  categoryId: string,
  action?: "activate" | "deactivate",
): string {
  const base = `${API_ENDPOINTS.merchantCategories}/${categoryId}`;
  if (action) {
    return `${base}/${action}`;
  }
  return base;
}

export type ApiEndpointKey = keyof typeof API_ENDPOINTS;

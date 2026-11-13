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
  merchantProfile: `${API_V1_PREFIX}/merchant/profile`,
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
  merchantStoreSettings: `${API_V1_PREFIX}/merchant/store/settings`,
  subscriptionPlans: `${API_V1_PREFIX}/subscription/plans`,
  merchantSubscription: `${API_V1_PREFIX}/merchant/subscription`,
  merchantSubscriptionSelect: `${API_V1_PREFIX}/merchant/subscription/select`,
  merchantSubscriptionPaymentOrder: `${API_V1_PREFIX}/merchant/subscription/payment/order`,
  merchantSubscriptionPaymentVerify: `${API_V1_PREFIX}/merchant/subscription/payment/verify`,
  merchantCategories: `${API_V1_PREFIX}/merchant/categories`,
  merchantCategoryImageUpload: `${API_V1_PREFIX}/merchant/categories/images/upload`,
  merchantProducts: `${API_V1_PREFIX}/merchant/products`,
  merchantProductImageUpload: `${API_V1_PREFIX}/merchant/products/images/upload`,
  merchantOrders: `${API_V1_PREFIX}/merchant/orders`,
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

export function merchantCategoryImagesPath(categoryId: string): string {
  return `${merchantCategoryPath(categoryId)}/images`;
}

export function merchantSubcategoriesPath(categoryId: string): string {
  return `${merchantCategoryPath(categoryId)}/subcategories`;
}

export function merchantSubcategoryPath(
  categoryId: string,
  subcategoryId: string,
  action?: "activate" | "deactivate",
): string {
  const base = `${merchantSubcategoriesPath(categoryId)}/${subcategoryId}`;
  if (action) {
    return `${base}/${action}`;
  }
  return base;
}

export function merchantProductPath(
  productId: string,
  action?: "activate" | "deactivate",
): string {
  const base = `${API_ENDPOINTS.merchantProducts}/${productId}`;
  if (action) {
    return `${base}/${action}`;
  }
  return base;
}

export function merchantProductImagesPath(productId: string): string {
  return `${merchantProductPath(productId)}/images`;
}

export function merchantOrderPath(orderId: string): string {
  return `${API_ENDPOINTS.merchantOrders}/${orderId}`;
}

export function merchantOrderStatusPath(orderId: string): string {
  return `${merchantOrderPath(orderId)}/status`;
}

export function merchantProductImagePath(
  productId: string,
  imageId: string,
): string {
  return `${merchantProductImagesPath(productId)}/${imageId}`;
}

export function merchantProductImagePrimaryPath(
  productId: string,
  imageId: string,
): string {
  return `${merchantProductImagePath(productId, imageId)}/primary`;
}

export type ApiEndpointKey = keyof typeof API_ENDPOINTS;

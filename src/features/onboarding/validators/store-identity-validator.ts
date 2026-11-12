import type { StoreIdentityFormValues } from "../types/store-identity";

export const MAX_STORE_NAME_LENGTH = 255;
export const MAX_DESCRIPTION_LENGTH = 160;
const MIN_SUBDOMAIN_LENGTH = 3;
const MAX_SUBDOMAIN_LENGTH = 63;

const SUBDOMAIN_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const RESERVED_SUBDOMAINS = new Set([
  "admin",
  "api",
  "app",
  "assets",
  "auth",
  "billing",
  "business",
  "dashboard",
  "docs",
  "health",
  "help",
  "login",
  "merchant",
  "openapi",
  "profile",
  "register",
  "static",
  "status",
  "store",
  "support",
  "swagger",
  "www",
]);

export function normalizeSubdomain(raw: string): string {
  return raw.trim().toLowerCase();
}

export function slugifyStoreName(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Returns null when [slug] passes format rules (does not call the API). */
export function validateSubdomainFormat(slug: string): string | null {
  if (slug.length === 0) {
    return "Store subdomain is required";
  }
  if (slug.length < MIN_SUBDOMAIN_LENGTH) {
    return "Store subdomain must be at least 3 characters";
  }
  if (slug.length > MAX_SUBDOMAIN_LENGTH) {
    return "Store subdomain is too long";
  }
  if (!SUBDOMAIN_PATTERN.test(slug)) {
    return "Store subdomain may only contain lowercase letters, numbers, and single hyphens";
  }
  if (RESERVED_SUBDOMAINS.has(slug)) {
    return "This store subdomain is reserved";
  }
  return null;
}

export type StoreIdentityValidationResult = {
  values: StoreIdentityFormValues | null;
  error: string | null;
};

export function normalizeAndValidateStoreIdentity(
  raw: StoreIdentityFormValues,
): StoreIdentityValidationResult {
  const storeName = raw.storeName.trim();
  const subdomain = normalizeSubdomain(raw.subdomain);
  const description = raw.description.trim();

  if (storeName.length === 0) {
    return { values: null, error: "Store name is required" };
  }
  if (storeName.length > MAX_STORE_NAME_LENGTH) {
    return { values: null, error: "Store name is too long" };
  }

  const subdomainError = validateSubdomainFormat(subdomain);
  if (subdomainError) {
    return { values: null, error: subdomainError };
  }

  if (description.length === 0) {
    return { values: null, error: "Store description is required" };
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { values: null, error: "Store description is too long" };
  }

  return {
    values: { storeName, subdomain, description },
    error: null,
  };
}

/**
 * Mirrors Flutter `lib/config/api_config.dart` (source of truth for API host + prefix).
 */
export const FLUTTER_API_BASE_URL = "https://api.openmystore.in" as const;

export const API_V1_PREFIX = "/api/v1" as const;

function readApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }
  return FLUTTER_API_BASE_URL;
}

/** Resolved API origin used by Axios (no trailing slash). */
export const apiBaseUrl = readApiBaseUrl();

/**
 * Example: `https://api.openmystore.in/api/v1/merchant/register`
 * (Flutter `MerchantRegistrationService._path` = `${apiV1Prefix}/merchant/register`)
 */
export function absoluteApiUrl(pathFromRoot: string): string {
  const path = pathFromRoot.startsWith("/") ? pathFromRoot : `/${pathFromRoot}`;
  return `${apiBaseUrl}${path}`;
}

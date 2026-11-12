import { apiBaseUrl, FLUTTER_API_BASE_URL } from "./api-config";

/**
 * Public environment configuration (safe for client bundles when prefixed with NEXT_PUBLIC_).
 * `apiBaseUrl` defaults to Flutter `ApiConfig.baseUrl` when `NEXT_PUBLIC_API_BASE_URL` is unset.
 */
export const env = {
  apiBaseUrl,
  /** Documented default from Flutter (for UI / logs). */
  defaultApiBaseUrl: FLUTTER_API_BASE_URL,
} as const;

export function assertApiBaseUrl(): string {
  return env.apiBaseUrl;
}

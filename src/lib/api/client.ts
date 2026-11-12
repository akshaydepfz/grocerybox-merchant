import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { apiBaseUrl } from "@/config/api-config";

import type { ApiErrorBody, AuthorizationHeaderProvider } from "./types";
import { ApiError } from "./types";

export type CreateApiClientOptions = {
  baseURL?: string;
  getAuthorizationHeader?: AuthorizationHeaderProvider;
};

let defaultAuthorizationProvider: AuthorizationHeaderProvider | undefined;

/**
 * Register how the client resolves the Authorization header.
 * Implementation will mirror Flutter once token storage is defined.
 */
export function setAuthorizationHeaderProvider(
  provider: AuthorizationHeaderProvider | undefined,
): void {
  defaultAuthorizationProvider = provider;
}

function resolveBaseUrl(explicit?: string): string {
  const base = explicit?.trim() || apiBaseUrl;
  return base.replace(/\/+$/, "");
}

function isFormDataBody(data: unknown): data is FormData {
  return typeof FormData !== "undefined" && data instanceof FormData;
}

function parseErrorBody(data: unknown): ApiErrorBody | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }
  return data as ApiErrorBody;
}

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const body = parseErrorBody(error.response?.data);
  const message =
    body?.message ??
    error.message ??
    (status ? `Request failed with status ${status}` : "Network request failed");
  return new ApiError(message, status, body);
}

async function attachAuthHeader(
  config: InternalAxiosRequestConfig,
  getAuthorizationHeader?: AuthorizationHeaderProvider,
): Promise<InternalAxiosRequestConfig> {
  const provider = getAuthorizationHeader ?? defaultAuthorizationProvider;
  if (!provider) {
    return config;
  }

  const header = await provider();
  if (header) {
    config.headers.set("Authorization", header);
  }
  return config;
}

export function createApiClient(
  options: CreateApiClientOptions = {},
): AxiosInstance {
  const instance = axios.create({
    baseURL: resolveBaseUrl(options.baseURL),
    headers: {
      Accept: "application/json",
    },
    timeout: 30_000,
  });

  instance.interceptors.request.use(async (config) => {
    const next = await attachAuthHeader(config, options.getAuthorizationHeader);
    if (isFormDataBody(next.data)) {
      // Let the runtime set multipart boundary (Flutter `postMultipart` parity).
      next.headers.delete("Content-Type");
    } else if (next.data !== undefined && !next.headers.has("Content-Type")) {
      next.headers.set("Content-Type", "application/json");
    }
    return next;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(toApiError(error)),
  );

  return instance;
}

/** Shared application API client. */
export const apiClient = createApiClient();

export type ApiRequestConfig = AxiosRequestConfig;

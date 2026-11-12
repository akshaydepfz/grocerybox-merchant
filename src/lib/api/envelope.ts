import type { ApiErrorBody } from "./types";

export type ApiEnvelope<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

export function parseApiEnvelope(body: unknown): ApiEnvelope {
  if (!body || typeof body !== "object") {
    return {
      success: false,
      message: "Unexpected server response",
    };
  }
  const json = body as Record<string, unknown>;
  return {
    success: typeof json.success === "boolean" ? json.success : false,
    message: typeof json.message === "string" ? json.message : "",
    data: json.data,
  };
}

export function envelopeErrorMessage(
  status: number,
  envelope: ApiEnvelope,
  fallback?: string,
): string {
  if (envelope.message.length > 0) {
    return envelope.message;
  }
  if (fallback) {
    return fallback;
  }
  switch (status) {
    case 401:
      return "Authentication failed. Please sign in again.";
    case 404:
      return "Resource not found.";
    default:
      return `Request failed (${status}).`;
  }
}

export type { ApiErrorBody };

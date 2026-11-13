import { ApiError } from "@/lib/api/types";

export function friendlyMerchantProfileError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Your session expired. Please sign in again.";
    }
    if (error.status === 403) {
      return error.message.length > 0
        ? error.message
        : "Your account is disabled or you do not have access.";
    }
    if (error.status === 404) {
      return "Merchant profile was not found. Try again in a moment.";
    }
    if (error.status === 0) {
      return "Could not reach the server. Check your internet connection and try again.";
    }
  }

  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("network") || lower.includes("timeout")) {
      return "Network error. Check your connection and try again.";
    }
  }

  if (error instanceof ApiError && error.message.length > 0) {
    return error.message;
  }

  return "Unable to load your profile. Please try again.";
}

export function friendlyProfileNameUpdateError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Your session expired. Please sign in again.";
    }
    if (error.status === 400) {
      return error.message.length > 0
        ? error.message
        : "Enter a valid name.";
    }
    if (error.status === 403) {
      return "You cannot update this profile right now.";
    }
  }
  return friendlyMerchantProfileError(error);
}

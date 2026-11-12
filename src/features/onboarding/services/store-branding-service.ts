import type { AxiosProgressEvent } from "axios";

import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

import {
  brandingColorUpdateToJson,
  storeBrandingFromEnvelope,
  type StoreBrandingColorUpdate,
  type StoreBrandingData,
} from "../types/store-branding";

function parseBrandingResponse(
  data: unknown,
  status: number,
): StoreBrandingData {
  const envelope = parseApiEnvelope(data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(envelopeErrorMessage(status, envelope), status);
  }
  return storeBrandingFromEnvelope(envelope.data as Record<string, unknown>);
}

export async function fetchBranding(): Promise<StoreBrandingData> {
  const response = await apiClient.get(API_ENDPOINTS.merchantStoreBranding);
  return parseBrandingResponse(response.data, response.status);
}

export async function updateBrandingColors(
  update: StoreBrandingColorUpdate,
): Promise<StoreBrandingData> {
  const response = await apiClient.put(
    API_ENDPOINTS.merchantStoreBranding,
    brandingColorUpdateToJson(update),
  );
  return parseBrandingResponse(response.data, response.status);
}

async function uploadBrandingFile(
  path: string,
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<StoreBrandingData> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await apiClient.post(path, formData, {
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!onProgress || !event.total) return;
      onProgress(event.loaded / event.total);
    },
  });
  return parseBrandingResponse(response.data, response.status);
}

export async function uploadLogo(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<StoreBrandingData> {
  return uploadBrandingFile(
    API_ENDPOINTS.merchantStoreBrandingLogo,
    file,
    onProgress,
  );
}

export async function uploadBanner(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<StoreBrandingData> {
  return uploadBrandingFile(
    API_ENDPOINTS.merchantStoreBrandingBanner,
    file,
    onProgress,
  );
}

export async function deleteLogo(): Promise<StoreBrandingData> {
  const response = await apiClient.delete(API_ENDPOINTS.merchantStoreBrandingLogo);
  return parseBrandingResponse(response.data, response.status);
}

export async function deleteBanner(): Promise<StoreBrandingData> {
  const response = await apiClient.delete(
    API_ENDPOINTS.merchantStoreBrandingBanner,
  );
  return parseBrandingResponse(response.data, response.status);
}

export function friendlyBrandingUploadMessage(error: ApiError): string {
  if (error.status === 502) {
    return "Unable to upload image. Please try again.";
  }
  if (error.status === 413) {
    return "Uploaded image is too large.";
  }
  if (error.status === 400) {
    return error.message.length > 0 ? error.message : "Unsupported image format.";
  }
  return error.message;
}

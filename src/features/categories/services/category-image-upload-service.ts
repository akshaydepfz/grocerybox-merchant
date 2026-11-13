import type { AxiosProgressEvent } from "axios";

import {
  API_ENDPOINTS,
  merchantCategoryImagesPath,
} from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import { envelopeErrorMessage, parseApiEnvelope } from "@/lib/api/envelope";
import { ApiError } from "@/lib/api/types";

export type CategoryImageUploadResult = {
  imageUrl: string;
};

export async function uploadMerchantCategoryImage(options: {
  file: File;
  categoryId?: string;
  onProgress?: (ratio: number) => void;
}): Promise<CategoryImageUploadResult> {
  const path = options.categoryId
    ? merchantCategoryImagesPath(options.categoryId)
    : API_ENDPOINTS.merchantCategoryImageUpload;

  const formData = new FormData();
  formData.append("image", options.file, options.file.name);
  if (options.categoryId && path === API_ENDPOINTS.merchantCategoryImageUpload) {
    formData.append("category_id", options.categoryId);
  }

  const response = await apiClient.post(path, formData, {
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!options.onProgress || !event.total) {
        return;
      }
      options.onProgress(event.loaded / event.total);
    },
  });

  const envelope = parseApiEnvelope(response.data);
  if (!envelope.success || typeof envelope.data !== "object") {
    throw new ApiError(
      envelopeErrorMessage(response.status, envelope),
      response.status,
    );
  }

  const record = envelope.data as Record<string, unknown>;
  const imageUrl =
    typeof record.image_url === "string" ? record.image_url.trim() : "";
  if (!imageUrl) {
    throw new ApiError("Upload response missing image URL.", response.status);
  }

  return { imageUrl };
}

export function friendlyCategoryImageUploadMessage(error: ApiError): string {
  if (error.status === 0) {
    return "Network error during image upload.";
  }
  if (error.status === 502) {
    return "Unable to upload image. Please try again.";
  }
  if (error.status === 413 || error.status === 400) {
    return error.message.length > 0
      ? error.message
      : "Uploaded image is too large or unsupported.";
  }
  return error.message.length > 0
    ? error.message
    : "Unable to upload category image.";
}

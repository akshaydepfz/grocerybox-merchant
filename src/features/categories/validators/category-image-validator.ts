const MAX_CATEGORY_IMAGE_BYTES = 15 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function extensionFromFilename(filename: string): string | null {
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return null;
  return filename.slice(dot).toLowerCase();
}

export function validateCategoryImageUpload(
  byteLength: number,
  mimeType: string,
  filename: string,
): string | null {
  const normalizedMime = mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
  const extension = extensionFromFilename(filename);

  if (
    !ALLOWED_MIME.has(normalizedMime) &&
    (extension == null || !ALLOWED_EXT.has(extension))
  ) {
    return "Category image must be a JPEG, PNG, or WebP file.";
  }

  if (byteLength > MAX_CATEGORY_IMAGE_BYTES) {
    return "Category image must be 15 MB or smaller.";
  }

  if (byteLength <= 0) {
    return "Selected image file is empty.";
  }

  return null;
}

export function revokeCategoryPreview(previewUrl: string | null | undefined) {
  if (previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
}

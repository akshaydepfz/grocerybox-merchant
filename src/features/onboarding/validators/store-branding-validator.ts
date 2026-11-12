const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const MAX_BANNER_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function extensionFromFilename(filename: string): string | null {
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return null;
  return filename.slice(dot).toLowerCase();
}

function validateImageUpload({
  byteLength,
  mimeType,
  filename,
  maxBytes,
  label,
}: {
  byteLength: number;
  mimeType: string;
  filename: string;
  maxBytes: number;
  label: string;
}): string | null {
  const normalizedMime = mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
  const extension = extensionFromFilename(filename);

  if (
    !ALLOWED_MIME.has(normalizedMime) &&
    (extension == null || !ALLOWED_EXT.has(extension))
  ) {
    return `${label} must be a JPEG, PNG or WebP image.`;
  }

  if (byteLength > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);
    return `${label} must be ${maxMb} MB or smaller.`;
  }

  return null;
}

export function validateLogoUpload(
  byteLength: number,
  mimeType: string,
  filename: string,
): string | null {
  return validateImageUpload({
    byteLength,
    mimeType,
    filename,
    maxBytes: MAX_LOGO_BYTES,
    label: "Logo",
  });
}

export function validateBannerUpload(
  byteLength: number,
  mimeType: string,
  filename: string,
): string | null {
  return validateImageUpload({
    byteLength,
    mimeType,
    filename,
    maxBytes: MAX_BANNER_BYTES,
    label: "Banner",
  });
}

export function validateBrandingColors(
  primaryColor: string,
  secondaryColor: string,
): string | null {
  if (!HEX_COLOR.test(primaryColor.trim())) {
    return "Primary colour must be a valid hex value.";
  }
  if (!HEX_COLOR.test(secondaryColor.trim())) {
    return "Secondary colour must be a valid hex value.";
  }
  return null;
}

export function mimeTypeForFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export function displayNameFromUrl(
  url: string | null | undefined,
  fallback: string,
): string {
  if (!url) return fallback;
  try {
    const segment = new URL(url).pathname.split("/").pop();
    return segment && segment.length > 0 ? segment : fallback;
  } catch {
    return fallback;
  }
}

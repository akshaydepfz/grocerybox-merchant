export type StoreBrandingFields = {
  logoKey?: string | null;
  logoUrl?: string | null;
  bannerKey?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

export type StoreBrandingData = {
  storeId: string;
  merchantId: string;
  branding: StoreBrandingFields;
};

export type StoreBrandingColorUpdate = {
  primaryColor: string;
  secondaryColor: string;
};

export function storeBrandingFromEnvelope(
  data: Record<string, unknown>,
): StoreBrandingData {
  const brandingRaw = data.branding;
  const branding =
    brandingRaw && typeof brandingRaw === "object"
      ? parseBrandingFields(brandingRaw as Record<string, unknown>)
      : {};

  return {
    storeId: data.store_id?.toString() ?? "",
    merchantId: data.merchant_id?.toString() ?? "",
    branding,
  };
}

function parseBrandingFields(
  json: Record<string, unknown>,
): StoreBrandingFields {
  return {
    logoKey: nullableString(json.logo_key),
    logoUrl: nullableString(json.logo_url),
    bannerKey: nullableString(json.banner_key),
    bannerUrl: nullableString(json.banner_url),
    primaryColor: nullableString(json.primary_color),
    secondaryColor: nullableString(json.secondary_color),
  };
}

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value);
  return text.length > 0 ? text : null;
}

export function brandingColorUpdateToJson(
  update: StoreBrandingColorUpdate,
): Record<string, string> {
  return {
    primary_color: update.primaryColor,
    secondary_color: update.secondaryColor,
  };
}

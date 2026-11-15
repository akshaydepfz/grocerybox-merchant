import type { BusinessInformationFormValues } from "../types/business-information";

const ALLOWED_BUSINESS_TYPES = new Set([
  "retail",
  "fruits",
  "bakery",
  "specialty",
]);

const MOBILE_PATTERN = /^[6-9][0-9]{9}$/;
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BusinessInformationValidationResult = {
  values: BusinessInformationFormValues | null;
  error: string | null;
};

/** Client-side validation aligned with backend `ValidateBusinessInformation`. */
export function normalizeAndValidateBusinessInformation(
  raw: BusinessInformationFormValues,
  merchantEmail: string,
): BusinessInformationValidationResult {
  const businessName = raw.businessName.trim();
  const businessType = raw.businessType?.trim() ?? null;
  const ownerFullName = raw.ownerFullName.trim();
  const mobileDigits = raw.mobileNumber.replace(/\s+/g, "");
  const email = raw.email.trim();
  const gstin = raw.gstin.trim().toUpperCase();

  if (businessName.length === 0) {
    return { values: null, error: "Business name is required" };
  }
  if (businessName.length > 255) {
    return { values: null, error: "Business name is too long" };
  }

  if (!businessType) {
    return { values: null, error: "Business type is required" };
  }
  if (!ALLOWED_BUSINESS_TYPES.has(businessType)) {
    return { values: null, error: "Invalid business type" };
  }

  if (ownerFullName.length === 0) {
    return { values: null, error: "Owner full name is required" };
  }
  if (ownerFullName.length > 255) {
    return { values: null, error: "Owner full name is too long" };
  }

  if (mobileDigits.length === 0) {
    return { values: null, error: "Mobile number is required" };
  }
  if (!MOBILE_PATTERN.test(mobileDigits)) {
    return { values: null, error: "Invalid mobile number" };
  }

  if (email.length === 0) {
    return { values: null, error: "Email address is required" };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { values: null, error: "Invalid email address" };
  }
  if (email.toLowerCase() !== merchantEmail.trim().toLowerCase()) {
    return {
      values: null,
      error: "Email address must match signed-in merchant email",
    };
  }

  if (gstin.length > 0 && !GSTIN_PATTERN.test(gstin)) {
    return { values: null, error: "Invalid GSTIN" };
  }

  return {
    values: {
      businessName,
      businessType,
      ownerFullName,
      mobileNumber: mobileDigits,
      email,
      gstin,
    },
    error: null,
  };
}
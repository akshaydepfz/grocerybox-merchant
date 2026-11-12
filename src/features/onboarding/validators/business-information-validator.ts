import type { BusinessInformationFormValues } from "../types/business-information";

const ALLOWED_BUSINESS_TYPES = new Set([
  "retail",
  "fruits",
  "bakery",
  "specialty",
]);

const ALLOWED_STATES = new Set([
  "Kerala",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
]);

const ALLOWED_DISTRICTS = new Set([
  "Kozhikode",
  "Ernakulam",
  "Thiruvananthapuram",
  "Malappuram",
]);

const ALLOWED_CITIES = new Set(["Kozhikode", "Vadakara", "Koyilandy"]);

const MOBILE_PATTERN = /^[6-9][0-9]{9}$/;
const PIN_PATTERN = /^[0-9]{6}$/;
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BusinessInformationValidationResult = {
  values: BusinessInformationFormValues | null;
  error: string | null;
};

/** Client-side validation aligned with Flutter `BusinessInformationValidator`. */
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
  const addressLine1 = raw.addressLine1.trim();
  const addressLine2 = raw.addressLine2.trim();
  const state = raw.state.trim();
  const district = raw.district.trim();
  const city = raw.city.trim();
  const pinCode = raw.pinCode.trim();

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

  if (addressLine1.length === 0) {
    return { values: null, error: "Address line 1 is required" };
  }
  if (addressLine1.length > 255) {
    return { values: null, error: "Address line 1 is too long" };
  }
  if (addressLine2.length > 255) {
    return { values: null, error: "Address line 2 is too long" };
  }

  if (state.length === 0) {
    return { values: null, error: "State is required" };
  }
  if (!ALLOWED_STATES.has(state)) {
    return { values: null, error: "Invalid state selection" };
  }

  if (district.length === 0) {
    return { values: null, error: "District is required" };
  }
  if (!ALLOWED_DISTRICTS.has(district)) {
    return { values: null, error: "Invalid district selection" };
  }

  if (city.length === 0) {
    return { values: null, error: "City is required" };
  }
  if (!ALLOWED_CITIES.has(city)) {
    return { values: null, error: "Invalid city selection" };
  }

  if (pinCode.length === 0) {
    return { values: null, error: "PIN code is required" };
  }
  if (!PIN_PATTERN.test(pinCode)) {
    return { values: null, error: "Invalid PIN code" };
  }

  return {
    values: {
      businessName,
      businessType,
      ownerFullName,
      mobileNumber: mobileDigits,
      email,
      gstin,
      addressLine1,
      addressLine2,
      state,
      district,
      city,
      pinCode,
    },
    error: null,
  };
}

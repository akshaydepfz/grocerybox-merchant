/**
 * Skip the Choose Plan / Razorpay step during onboarding (dev or promo registration).
 * Store config continues to Review & Publish; resume routing ignores `subscription_plan`.
 */
export const SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT = true;

export const ONBOARDING_STEPS = [
  "Business Information",
  "Store Identity",
  "Store Branding",
  "Store Location",
  "Store Configuration",
  "Review & Publish",
] as const;

export const ONBOARDING_TOTAL_STEPS = ONBOARDING_STEPS.length;

export const BUSINESS_TYPE_OPTIONS = [
  { value: "retail", label: "Supermarket / Grocery Retail" },
  { value: "fruits", label: "Fresh Fruits & Vegetables" },
  { value: "bakery", label: "Bakery & Dairy" },
  { value: "specialty", label: "Organic & Specialty Store" },
] as const;

export const STATE_OPTIONS = [
  "Kerala",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
] as const;

export const DISTRICT_OPTIONS = [
  "Kozhikode",
  "Ernakulam",
  "Thiruvananthapuram",
  "Malappuram",
] as const;

export const CITY_OPTIONS = ["Kozhikode", "Vadakara", "Koyilandy"] as const;

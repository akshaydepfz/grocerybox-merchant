import { storeConfigFieldsFromJson } from "@/features/onboarding/types/store-config";
import { storeLocationFieldsFromJson } from "@/features/onboarding/types/store-location";
import type { StoreConfigFields } from "@/features/onboarding/types/store-config";
import type { StoreLocationFields } from "@/features/onboarding/types/store-location";

export type MerchantOnboardingStatus =
  | "account_registered"
  | "business_completed"
  | "store_completed"
  | "branding_completed"
  | "location_completed"
  | "config_completed"
  | "plan_selected"
  | "published"
  | (string & {});

export type MerchantAccountProfile = {
  firebaseUid: string | null;
  email: string | null;
  fullName: string | null;
  profileImageUrl: string | null;
  emailVerified: boolean;
  phone: string | null;
  accountStatus: string | null;
  createdAt: string | null;
};

export type BusinessInformationPayload = {
  businessName: string | null;
  businessType: string | null;
  ownerFullName: string | null;
  mobileNumber: string | null;
  gstin: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  pinCode: string | null;
};

export type StoreIdentityPayload = {
  storeName: string | null;
  subdomain: string | null;
  description: string | null;
};

export type StoreBrandingPayload = {
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
};

export type StoreLocationPayload = StoreLocationFields;

export type StoreConfigPayload = StoreConfigFields;

export type SubscriptionPlanPayload = {
  name: string | null;
  slug: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  billingInterval: string | null;
  features: string[];
};

export type MerchantSubscriptionPayload = {
  subscriptionId: string | null;
  status: string | null;
  startedAt: string | null;
  expiresAt: string | null;
  plan: SubscriptionPlanPayload | null;
};

export type MerchantProfile = {
  merchantId: string;
  businessId: string | null;
  storeId: string | null;
  onboardingStatus: MerchantOnboardingStatus;
  storePublished: boolean;
  publishedAt: string | null;
  account: MerchantAccountProfile | null;
  business: BusinessInformationPayload | null;
  store: StoreIdentityPayload | null;
  branding: StoreBrandingPayload | null;
  location: StoreLocationPayload | null;
  configuration: StoreConfigPayload | null;
  subscription: MerchantSubscriptionPayload | null;
};

export type MerchantProfileResponse = {
  success: boolean;
  message: string;
  profile: MerchantProfile | null;
};

export type MerchantProfileNameUpdateInput = {
  fullName: string;
};

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function readInt(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function readObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function merchantAccountFromJson(
  json: Record<string, unknown>,
): MerchantAccountProfile {
  return {
    firebaseUid: nullableString(json.firebase_uid),
    email: nullableString(json.email),
    fullName: nullableString(json.full_name),
    profileImageUrl: nullableString(json.profile_image_url),
    emailVerified: (json.email_verified as boolean) ?? false,
    phone: nullableString(json.phone),
    accountStatus: nullableString(json.account_status),
    createdAt: nullableString(json.created_at),
  };
}

export function businessInformationFromJson(
  json: Record<string, unknown>,
): BusinessInformationPayload {
  return {
    businessName: nullableString(json.business_name),
    businessType: nullableString(json.business_type),
    ownerFullName: nullableString(json.owner_full_name),
    mobileNumber: nullableString(json.mobile_number),
    gstin: nullableString(json.gstin),
    addressLine1: nullableString(json.address_line1),
    addressLine2: nullableString(json.address_line2),
    state: nullableString(json.state),
    district: nullableString(json.district),
    city: nullableString(json.city),
    pinCode: nullableString(json.pin_code),
  };
}

export function storeIdentityFromJson(
  json: Record<string, unknown>,
): StoreIdentityPayload {
  return {
    storeName: nullableString(json.store_name),
    subdomain: nullableString(json.subdomain),
    description: nullableString(json.description),
  };
}

export function storeBrandingFromJson(
  json: Record<string, unknown>,
): StoreBrandingPayload {
  return {
    logoUrl: nullableString(json.logo_url),
    bannerUrl: nullableString(json.banner_url),
    primaryColor: nullableString(json.primary_color),
    secondaryColor: nullableString(json.secondary_color),
  };
}

export function subscriptionPlanFromProfileJson(
  json: Record<string, unknown>,
): SubscriptionPlanPayload {
  return {
    name: nullableString(json.name),
    slug: nullableString(json.slug),
    description: nullableString(json.description),
    price: readInt(json.price),
    currency: nullableString(json.currency),
    billingInterval: nullableString(json.billing_interval),
    features: readStringList(json.features),
  };
}

export function merchantSubscriptionFromProfileJson(
  json: Record<string, unknown>,
): MerchantSubscriptionPayload {
  const planRaw = readObject(json.plan);
  return {
    subscriptionId: nullableString(json.subscription_id),
    status: nullableString(json.status),
    startedAt: nullableString(json.started_at),
    expiresAt: nullableString(json.expires_at),
    plan: planRaw ? subscriptionPlanFromProfileJson(planRaw) : null,
  };
}

export function merchantProfileFromJson(
  data: Record<string, unknown>,
): MerchantProfile {
  const accountRaw = readObject(data.account);
  const businessRaw = readObject(data.business);
  const storeRaw = readObject(data.store);
  const brandingRaw = readObject(data.branding);
  const locationRaw = readObject(data.location);
  const configRaw =
    readObject(data.configuration) ?? readObject(data.config);
  const subscriptionRaw = readObject(data.subscription);

  return {
    merchantId: nullableString(data.merchant_id) ?? "",
    businessId: nullableString(data.business_id),
    storeId: nullableString(data.store_id),
    onboardingStatus: (nullableString(data.onboarding_status) ??
      "account_registered") as MerchantOnboardingStatus,
    storePublished: (data.store_published as boolean) ?? false,
    publishedAt: nullableString(data.published_at),
    account: accountRaw ? merchantAccountFromJson(accountRaw) : null,
    business: businessRaw ? businessInformationFromJson(businessRaw) : null,
    store: storeRaw ? storeIdentityFromJson(storeRaw) : null,
    branding: brandingRaw ? storeBrandingFromJson(brandingRaw) : null,
    location: locationRaw
      ? storeLocationFieldsFromJson(locationRaw)
      : null,
    configuration: configRaw ? storeConfigFieldsFromJson(configRaw) : null,
    subscription: subscriptionRaw
      ? merchantSubscriptionFromProfileJson(subscriptionRaw)
      : null,
  };
}

export function merchantProfileFromEnvelopeData(
  data: unknown,
): MerchantProfile {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid merchant profile payload");
  }
  return merchantProfileFromJson(data as Record<string, unknown>);
}

export function merchantProfileNameUpdateToJson(
  input: MerchantProfileNameUpdateInput,
): Record<string, string> {
  return { full_name: input.fullName.trim() };
}

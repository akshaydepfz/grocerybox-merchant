import {
  FULL_MERCHANT_PROFILE_JSON,
  MINIMAL_MERCHANT_PROFILE_JSON,
} from "./merchant-profile.fixtures";
import { merchantProfileFromJson } from "./merchant-profile";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runMerchantProfileParseSelfCheck(): void {
  const minimal = merchantProfileFromJson({
    ...MINIMAL_MERCHANT_PROFILE_JSON,
  });
  assert(minimal.merchantId === "m_min_001", "minimal merchant_id");
  assert(minimal.account?.fullName === "Asha Nair", "minimal full_name");
  assert(minimal.business === null, "minimal business null");
  assert(minimal.store === null, "minimal store null");
  assert(!minimal.storePublished, "minimal store_published");

  const full = merchantProfileFromJson({ ...FULL_MERCHANT_PROFILE_JSON });
  assert(full.merchantId === "m_full_001", "full merchant_id");
  assert(full.business?.businessName === "Fresh Mart Pvt Ltd", "full business");
  assert(full.store?.subdomain === "freshmart", "full subdomain");
  assert(full.branding?.primaryColor === "#16A34A", "full branding");
  assert(full.location?.latitude === 11.2588, "full latitude");
  assert(full.configuration?.codEnabled === false, "full config");
  assert(
    full.subscription?.plan?.features.length === 3,
    "full subscription features",
  );
  assert(full.storePublished, "full store_published");
  assert(full.onboardingStatus === "plan_selected", "full onboarding_status");
}

runMerchantProfileParseSelfCheck();
console.log("merchant-profile parse self-check: OK");

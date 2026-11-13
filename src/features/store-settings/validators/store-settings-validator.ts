import type { StoreSettingsData } from "../types/store-settings";
import { storeSettingsPatchBodyFromData } from "../types/store-settings";

/** Aligned with backend `store_settings_validator.go` and Flutter client. */
export const STORE_SETTINGS_MAX_DELIVERY_RADIUS_KM = 50;
export const STORE_SETTINGS_MAX_MONEY_VALUE = 999_999.99;

export function validateStoreSettingsForm(input: {
  whatsAppOrders: boolean;
  websiteOrders: boolean;
  upiEnabled: boolean;
  codEnabled: boolean;
  homeDeliveryEnabled: boolean;
  storePickupEnabled: boolean;
  deliveryRadiusKmText: string;
  minimumOrderValueText: string;
  standardDeliveryFeeText: string;
  freeDeliveryThresholdText: string;
  platformHandlingFeeText: string;
}):
  | { data: StoreSettingsData; patchBody: ReturnType<typeof storeSettingsPatchBodyFromData>; error: null }
  | { data: null; patchBody: null; error: string } {
  const radius = parsePositiveNumber(input.deliveryRadiusKmText, {
    fieldLabel: "Delivery radius",
    allowZero: false,
    max: STORE_SETTINGS_MAX_DELIVERY_RADIUS_KM,
  });
  if (radius.error) {
    return { data: null, patchBody: null, error: radius.error };
  }

  const minimumOrder = parsePositiveNumber(input.minimumOrderValueText, {
    fieldLabel: "Minimum order value",
    allowZero: true,
    max: STORE_SETTINGS_MAX_MONEY_VALUE,
  });
  if (minimumOrder.error) {
    return { data: null, patchBody: null, error: minimumOrder.error };
  }

  const standardFee = parsePositiveNumber(input.standardDeliveryFeeText, {
    fieldLabel: "Standard delivery fee",
    allowZero: true,
    max: STORE_SETTINGS_MAX_MONEY_VALUE,
  });
  if (standardFee.error) {
    return { data: null, patchBody: null, error: standardFee.error };
  }

  const freeThreshold = parsePositiveNumber(input.freeDeliveryThresholdText, {
    fieldLabel: "Free delivery threshold",
    allowZero: true,
    max: STORE_SETTINGS_MAX_MONEY_VALUE,
  });
  if (freeThreshold.error) {
    return { data: null, patchBody: null, error: freeThreshold.error };
  }

  const platformFee = parsePositiveNumber(input.platformHandlingFeeText, {
    fieldLabel: "Platform and handling fee",
    allowZero: true,
    max: STORE_SETTINGS_MAX_MONEY_VALUE,
  });
  if (platformFee.error) {
    return { data: null, patchBody: null, error: platformFee.error };
  }

  const data: StoreSettingsData = {
    orders: {
      whatsAppOrders: input.whatsAppOrders,
      websiteOrders: input.websiteOrders,
    },
    payments: {
      upiEnabled: input.upiEnabled,
      codEnabled: input.codEnabled,
    },
    fulfillment: {
      homeDeliveryEnabled: input.homeDeliveryEnabled,
      storePickupEnabled: input.storePickupEnabled,
      deliveryRadiusKm: radius.value!,
    },
    orderLimits: {
      minimumOrderValue: minimumOrder.value!,
    },
    deliveryPricing: {
      standardDeliveryFee: standardFee.value!,
      freeDeliveryThreshold: freeThreshold.value!,
      platformHandlingFee: platformFee.value!,
    },
  };

  return {
    data,
    patchBody: storeSettingsPatchBodyFromData(data),
    error: null,
  };
}

function parsePositiveNumber(
  text: string,
  options: {
    fieldLabel: string;
    allowZero: boolean;
    max: number;
  },
): { value: number | null; error: string | null } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { value: null, error: `${options.fieldLabel} is required` };
  }

  const value = Number.parseFloat(trimmed);
  if (!Number.isFinite(value)) {
    return { value: null, error: `${options.fieldLabel} must be a valid number` };
  }
  if (!options.allowZero && value <= 0) {
    return {
      value: null,
      error: `${options.fieldLabel} must be greater than zero`,
    };
  }
  if (options.allowZero && value < 0) {
    return { value: null, error: `${options.fieldLabel} cannot be negative` };
  }
  if (value > options.max) {
    return { value: null, error: `${options.fieldLabel} is too large` };
  }
  return { value, error: null };
}

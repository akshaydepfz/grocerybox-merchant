import type { StoreConfigFormValues } from "../types/store-config";

export const STORE_CONFIG_DELIVERY_RADII = [
  "5 km",
  "10 km",
  "15 km",
  "20 km",
] as const;

export const STORE_CONFIG_MIN_ORDER_MIN = 1;
export const STORE_CONFIG_MIN_ORDER_MAX = 999_999;

export function validateStoreConfig(input: {
  whatsAppOrders: boolean;
  websiteOrders: boolean;
  homeDelivery: boolean;
  storePickup: boolean;
  deliveryRadius: string;
  minimumOrderValueText: string;
  upiEnabled: boolean;
  codEnabled: boolean;
}):
  | { values: StoreConfigFormValues; error: null }
  | { values: null; error: string } {
  const radius = input.deliveryRadius.trim();
  if (!radius) {
    return { values: null, error: "Delivery radius is required" };
  }
  if (
    !STORE_CONFIG_DELIVERY_RADII.includes(
      radius as (typeof STORE_CONFIG_DELIVERY_RADII)[number],
    )
  ) {
    return { values: null, error: "Invalid delivery radius selection" };
  }

  const minText = input.minimumOrderValueText.trim();
  if (!minText) {
    return { values: null, error: "Minimum order value is required" };
  }
  const minValue = Number.parseInt(minText, 10);
  if (!Number.isFinite(minValue)) {
    return { values: null, error: "Minimum order value must be a whole number" };
  }
  if (minValue < STORE_CONFIG_MIN_ORDER_MIN) {
    return { values: null, error: "Minimum order value is required" };
  }
  if (minValue > STORE_CONFIG_MIN_ORDER_MAX) {
    return { values: null, error: "Minimum order value is too large" };
  }

  return {
    values: {
      whatsAppOrders: input.whatsAppOrders,
      websiteOrders: input.websiteOrders,
      homeDelivery: input.homeDelivery,
      storePickup: input.storePickup,
      deliveryRadius: radius,
      minimumOrderValue: minValue,
      upiEnabled: input.upiEnabled,
      codEnabled: input.codEnabled,
    },
    error: null,
  };
}

export type StoreSettingsOrders = {
  whatsAppOrders: boolean;
  websiteOrders: boolean;
};

export type StoreSettingsPayments = {
  upiEnabled: boolean;
  codEnabled: boolean;
};

export type StoreSettingsFulfillment = {
  homeDeliveryEnabled: boolean;
  storePickupEnabled: boolean;
  deliveryRadiusKm: number;
};

export type StoreSettingsOrderLimits = {
  minimumOrderValue: number;
};

export type StoreSettingsDeliveryPricing = {
  standardDeliveryFee: number;
  freeDeliveryThreshold: number;
  platformHandlingFee: number;
};

export type StoreSettingsData = {
  orders: StoreSettingsOrders;
  payments: StoreSettingsPayments;
  fulfillment: StoreSettingsFulfillment;
  orderLimits: StoreSettingsOrderLimits;
  deliveryPricing: StoreSettingsDeliveryPricing;
};

export type StoreSettingsFormState = {
  whatsAppOrders: boolean;
  websiteOrders: boolean;
  upiEnabled: boolean;
  codEnabled: boolean;
  homeDeliveryEnabled: boolean;
  storePickupEnabled: boolean;
  deliveryRadiusKm: string;
  minimumOrderValue: string;
  standardDeliveryFee: string;
  freeDeliveryThreshold: string;
  platformHandlingFee: string;
};

export type StoreSettingsPatchBody = {
  orders: {
    whatsapp_orders: boolean;
    website_orders: boolean;
  };
  payments: {
    upi_enabled: boolean;
    cod_enabled: boolean;
  };
  fulfillment: {
    home_delivery_enabled: boolean;
    store_pickup_enabled: boolean;
    delivery_radius_km: number;
  };
  order_limits: {
    minimum_order_value: number;
  };
  delivery_pricing: {
    standard_delivery_fee: number;
    free_delivery_threshold: number;
    platform_handling_fee: number;
  };
};

function readDouble(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function readBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function storeSettingsOrdersFromJson(
  json: Record<string, unknown>,
): StoreSettingsOrders {
  return {
    whatsAppOrders: readBool(json.whatsapp_orders, true),
    websiteOrders: readBool(json.website_orders, false),
  };
}

export function storeSettingsPaymentsFromJson(
  json: Record<string, unknown>,
): StoreSettingsPayments {
  return {
    upiEnabled: readBool(json.upi_enabled, false),
    codEnabled: readBool(json.cod_enabled, true),
  };
}

export function storeSettingsFulfillmentFromJson(
  json: Record<string, unknown>,
): StoreSettingsFulfillment {
  return {
    homeDeliveryEnabled: readBool(json.home_delivery_enabled, true),
    storePickupEnabled: readBool(json.store_pickup_enabled, true),
    deliveryRadiusKm: readDouble(json.delivery_radius_km) ?? 10,
  };
}

export function storeSettingsOrderLimitsFromJson(
  json: Record<string, unknown>,
): StoreSettingsOrderLimits {
  return {
    minimumOrderValue: readDouble(json.minimum_order_value) ?? 0,
  };
}

export function storeSettingsDeliveryPricingFromJson(
  json: Record<string, unknown>,
): StoreSettingsDeliveryPricing {
  return {
    standardDeliveryFee: readDouble(json.standard_delivery_fee) ?? 25,
    freeDeliveryThreshold: readDouble(json.free_delivery_threshold) ?? 299,
    platformHandlingFee: readDouble(json.platform_handling_fee) ?? 5,
  };
}

export function storeSettingsFromEnvelopeData(
  data: Record<string, unknown>,
): StoreSettingsData {
  const ordersJson = data.orders;
  const paymentsJson = data.payments;
  const fulfillmentJson = data.fulfillment;
  const orderLimitsJson = data.order_limits;
  const deliveryPricingJson = data.delivery_pricing;

  return {
    orders:
      ordersJson && typeof ordersJson === "object"
        ? storeSettingsOrdersFromJson(ordersJson as Record<string, unknown>)
        : storeSettingsOrdersFromJson({}),
    payments:
      paymentsJson && typeof paymentsJson === "object"
        ? storeSettingsPaymentsFromJson(paymentsJson as Record<string, unknown>)
        : storeSettingsPaymentsFromJson({}),
    fulfillment:
      fulfillmentJson && typeof fulfillmentJson === "object"
        ? storeSettingsFulfillmentFromJson(
            fulfillmentJson as Record<string, unknown>,
          )
        : storeSettingsFulfillmentFromJson({}),
    orderLimits:
      orderLimitsJson && typeof orderLimitsJson === "object"
        ? storeSettingsOrderLimitsFromJson(
            orderLimitsJson as Record<string, unknown>,
          )
        : storeSettingsOrderLimitsFromJson({}),
    deliveryPricing:
      deliveryPricingJson && typeof deliveryPricingJson === "object"
        ? storeSettingsDeliveryPricingFromJson(
            deliveryPricingJson as Record<string, unknown>,
          )
        : storeSettingsDeliveryPricingFromJson({}),
  };
}

export function formatStoreSettingsNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(value);
}

export function storeSettingsDataToFormState(
  data: StoreSettingsData,
): StoreSettingsFormState {
  return {
    whatsAppOrders: data.orders.whatsAppOrders,
    websiteOrders: data.orders.websiteOrders,
    upiEnabled: data.payments.upiEnabled,
    codEnabled: data.payments.codEnabled,
    homeDeliveryEnabled: data.fulfillment.homeDeliveryEnabled,
    storePickupEnabled: data.fulfillment.storePickupEnabled,
    deliveryRadiusKm: formatStoreSettingsNumber(data.fulfillment.deliveryRadiusKm),
    minimumOrderValue: formatStoreSettingsNumber(data.orderLimits.minimumOrderValue),
    standardDeliveryFee: formatStoreSettingsNumber(
      data.deliveryPricing.standardDeliveryFee,
    ),
    freeDeliveryThreshold: formatStoreSettingsNumber(
      data.deliveryPricing.freeDeliveryThreshold,
    ),
    platformHandlingFee: formatStoreSettingsNumber(
      data.deliveryPricing.platformHandlingFee,
    ),
  };
}

export function storeSettingsPatchBodyFromData(
  data: StoreSettingsData,
): StoreSettingsPatchBody {
  return {
    orders: {
      whatsapp_orders: data.orders.whatsAppOrders,
      website_orders: data.orders.websiteOrders,
    },
    payments: {
      upi_enabled: data.payments.upiEnabled,
      cod_enabled: data.payments.codEnabled,
    },
    fulfillment: {
      home_delivery_enabled: data.fulfillment.homeDeliveryEnabled,
      store_pickup_enabled: data.fulfillment.storePickupEnabled,
      delivery_radius_km: data.fulfillment.deliveryRadiusKm,
    },
    order_limits: {
      minimum_order_value: data.orderLimits.minimumOrderValue,
    },
    delivery_pricing: {
      standard_delivery_fee: data.deliveryPricing.standardDeliveryFee,
      free_delivery_threshold: data.deliveryPricing.freeDeliveryThreshold,
      platform_handling_fee: data.deliveryPricing.platformHandlingFee,
    },
  };
}

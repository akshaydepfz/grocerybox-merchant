export type StoreConfigFields = {
  whatsAppOrders: boolean;
  websiteOrders: boolean;
  homeDelivery: boolean;
  storePickup: boolean;
  deliveryRadius: string;
  minimumOrderValue: number;
  upiEnabled: boolean;
  codEnabled: boolean;
};

export type StoreConfigData = {
  storeId: string;
  merchantId: string;
  config: StoreConfigFields;
};

export type StoreConfigFormValues = StoreConfigFields;

export type StoreConfigFormState = {
  whatsAppOrders: boolean;
  websiteOrders: boolean;
  homeDelivery: boolean;
  storePickup: boolean;
  deliveryRadius: string;
  minimumOrderValue: string;
  upiEnabled: boolean;
  codEnabled: boolean;
};

function readInt(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function defaultStoreConfigFields(): StoreConfigFields {
  return {
    whatsAppOrders: true,
    websiteOrders: false,
    homeDelivery: true,
    storePickup: true,
    deliveryRadius: "10 km",
    minimumOrderValue: 299,
    upiEnabled: true,
    codEnabled: true,
  };
}

export function defaultStoreConfigFormState(): StoreConfigFormState {
  const defaults = defaultStoreConfigFields();
  return {
    whatsAppOrders: defaults.whatsAppOrders,
    websiteOrders: defaults.websiteOrders,
    homeDelivery: defaults.homeDelivery,
    storePickup: defaults.storePickup,
    deliveryRadius: defaults.deliveryRadius,
    minimumOrderValue: String(defaults.minimumOrderValue),
    upiEnabled: defaults.upiEnabled,
    codEnabled: defaults.codEnabled,
  };
}

export function storeConfigFieldsFromJson(
  json: Record<string, unknown>,
): StoreConfigFields {
  return {
    whatsAppOrders: (json.whatsapp_orders as boolean) ?? true,
    websiteOrders: (json.website_orders as boolean) ?? false,
    homeDelivery: (json.home_delivery as boolean) ?? true,
    storePickup: (json.store_pickup as boolean) ?? true,
    deliveryRadius: (json.delivery_radius as string) ?? "10 km",
    minimumOrderValue: readInt(json.minimum_order_value) ?? 299,
    upiEnabled: (json.upi_enabled as boolean) ?? true,
    codEnabled: (json.cod_enabled as boolean) ?? true,
  };
}

export function storeConfigFromEnvelopeData(
  data: Record<string, unknown>,
): StoreConfigData {
  const configJson = data.config;
  return {
    storeId: data.store_id != null ? String(data.store_id) : "",
    merchantId: data.merchant_id != null ? String(data.merchant_id) : "",
    config:
      configJson && typeof configJson === "object"
        ? storeConfigFieldsFromJson(configJson as Record<string, unknown>)
        : defaultStoreConfigFields(),
  };
}

export function storeConfigToJson(
  values: StoreConfigFormValues,
): Record<string, boolean | number | string> {
  return {
    whatsapp_orders: values.whatsAppOrders,
    website_orders: values.websiteOrders,
    home_delivery: values.homeDelivery,
    store_pickup: values.storePickup,
    delivery_radius: values.deliveryRadius,
    minimum_order_value: values.minimumOrderValue,
    upi_enabled: values.upiEnabled,
    cod_enabled: values.codEnabled,
  };
}

export function storeConfigDataToFormState(
  config: StoreConfigFields,
): StoreConfigFormState {
  return {
    whatsAppOrders: config.whatsAppOrders,
    websiteOrders: config.websiteOrders,
    homeDelivery: config.homeDelivery,
    storePickup: config.storePickup,
    deliveryRadius: config.deliveryRadius,
    minimumOrderValue: String(config.minimumOrderValue),
    upiEnabled: config.upiEnabled,
    codEnabled: config.codEnabled,
  };
}

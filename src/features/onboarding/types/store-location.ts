export type StoreLocationFields = {
  storeAddress: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
  latitude: number | null;
  longitude: number | null;
};

export type StoreLocationData = {
  storeId: string;
  merchantId: string;
  location: StoreLocationFields;
};

export type StoreLocationFormValues = {
  storeAddress: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
  latitude: number;
  longitude: number;
};

export type StoreLocationFormState = {
  storeAddress: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
};

function readDouble(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

export function storeLocationFieldsFromJson(
  json: Record<string, unknown>,
): StoreLocationFields {
  return {
    storeAddress: (json.store_address as string) ?? "",
    state: (json.state as string) ?? "",
    district: (json.district as string) ?? "",
    city: (json.city as string) ?? "",
    pinCode: (json.pin_code as string) ?? "",
    latitude: readDouble(json.latitude),
    longitude: readDouble(json.longitude),
  };
}

export function storeLocationFromEnvelopeData(
  data: Record<string, unknown>,
): StoreLocationData {
  const locationJson = data.location;
  return {
    storeId: data.store_id != null ? String(data.store_id) : "",
    merchantId: data.merchant_id != null ? String(data.merchant_id) : "",
    location:
      locationJson && typeof locationJson === "object"
        ? storeLocationFieldsFromJson(locationJson as Record<string, unknown>)
        : {
            storeAddress: "",
            state: "",
            district: "",
            city: "",
            pinCode: "",
            latitude: null,
            longitude: null,
          },
  };
}

export function storeLocationToJson(
  values: StoreLocationFormValues,
): Record<string, string | number> {
  return {
    store_address: values.storeAddress,
    state: values.state,
    district: values.district,
    city: values.city,
    pin_code: values.pinCode,
    latitude: values.latitude,
    longitude: values.longitude,
  };
}

import type { StoreLocationFormValues } from "../types/store-location";

/** Client-side validation aligned with Flutter `StoreLocationValidator`. */
export const STORE_LOCATION_MAX_ADDRESS_LENGTH = 500;

export const STORE_LOCATION_ALLOWED_STATES = [
  "Kerala",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
] as const;

export const STORE_LOCATION_ALLOWED_DISTRICTS = [
  "Kozhikode",
  "Ernakulam",
  "Thiruvananthapuram",
  "Kannur",
] as const;

export const STORE_LOCATION_ALLOWED_CITIES = [
  "Kozhikode",
  "Vatakara",
  "Koyilandy",
] as const;

export const STORE_LOCATION_DEFAULT_STATE = "Kerala";
export const STORE_LOCATION_DEFAULT_DISTRICT = "Kozhikode";
export const STORE_LOCATION_DEFAULT_CITY = "Kozhikode";

const INDIAN_PIN_PATTERN = /^[0-9]{6}$/;

export function defaultStoreLocationFormState(): {
  storeAddress: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
} {
  return {
    storeAddress: "",
    state: STORE_LOCATION_DEFAULT_STATE,
    district: STORE_LOCATION_DEFAULT_DISTRICT,
    city: STORE_LOCATION_DEFAULT_CITY,
    pinCode: "",
  };
}

export function normalizePinCode(raw: string): string {
  return raw.trim();
}

function parseCoordinate(
  raw: string,
  min: number,
  max: number,
  label: string,
): { value: number | null; error: string | null } {
  const text = raw.trim();
  if (!text) {
    return { value: null, error: `Invalid ${label.toLowerCase()}` };
  }
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) {
    return { value: null, error: `Invalid ${label.toLowerCase()}` };
  }
  if (parsed < min || parsed > max) {
    return { value: null, error: `${label} is out of range` };
  }
  const rounded = Number(parsed.toFixed(7));
  return { value: rounded, error: null };
}

export function roundMapCoordinate(value: number): number {
  return Number(value.toFixed(7));
}

export function normalizeAndValidateStoreLocation(input: {
  storeAddress: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
  latitude: number;
  longitude: number;
}):
  | { values: StoreLocationFormValues; error: null }
  | { values: null; error: string } {
  const address = input.storeAddress.trim();
  const stateValue = input.state.trim();
  const districtValue = input.district.trim();
  const cityValue = input.city.trim();
  const pin = normalizePinCode(input.pinCode);

  if (!address) {
    return { values: null, error: "Store address is required" };
  }
  if (address.length > STORE_LOCATION_MAX_ADDRESS_LENGTH) {
    return { values: null, error: "Store address is too long" };
  }
  if (!stateValue) {
    return { values: null, error: "State is required" };
  }
  if (!STORE_LOCATION_ALLOWED_STATES.includes(
    stateValue as (typeof STORE_LOCATION_ALLOWED_STATES)[number],
  )) {
    return { values: null, error: "Invalid state selection" };
  }
  if (!districtValue) {
    return { values: null, error: "District is required" };
  }
  if (!STORE_LOCATION_ALLOWED_DISTRICTS.includes(
    districtValue as (typeof STORE_LOCATION_ALLOWED_DISTRICTS)[number],
  )) {
    return { values: null, error: "Invalid district selection" };
  }
  if (!cityValue) {
    return { values: null, error: "City / town is required" };
  }
  if (!STORE_LOCATION_ALLOWED_CITIES.includes(
    cityValue as (typeof STORE_LOCATION_ALLOWED_CITIES)[number],
  )) {
    return { values: null, error: "Invalid city selection" };
  }
  if (!pin) {
    return { values: null, error: "PIN code is required" };
  }
  if (!INDIAN_PIN_PATTERN.test(pin)) {
    return { values: null, error: "Invalid PIN code" };
  }

  const lat = parseCoordinate(
    String(input.latitude),
    -90,
    90,
    "Latitude",
  );
  if (lat.error) {
    return { values: null, error: lat.error };
  }

  const lng = parseCoordinate(
    String(input.longitude),
    -180,
    180,
    "Longitude",
  );
  if (lng.error) {
    return { values: null, error: lng.error };
  }

  return {
    values: {
      storeAddress: address,
      state: stateValue,
      district: districtValue,
      city: cityValue,
      pinCode: pin,
      latitude: lat.value!,
      longitude: lng.value!,
    },
    error: null,
  };
}

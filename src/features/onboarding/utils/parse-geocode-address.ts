import {
  INDIAN_STATES,
  isIndianState,
  type IndianState,
} from "../constants/indian-states";

export type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export type ParsedGeocodeAddress = {
  formattedAddress: string;
  storeAddress: string;
  state: string;
  district: string;
  city: string;
  pinCode: string;
};

const GOOGLE_STATE_ALIASES: Record<string, IndianState> = {
  "National Capital Territory of Delhi": "Delhi",
  "NCT of Delhi": "Delhi",
  Orissa: "Odisha",
  Pondicherry: "Puducherry",
  Uttaranchal: "Uttarakhand",
  "Jammu & Kashmir": "Jammu and Kashmir",
};

export function normalizeIndianStateName(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (isIndianState(trimmed)) return trimmed;
  const alias = GOOGLE_STATE_ALIASES[trimmed];
  if (alias) return alias;
  const ci = INDIAN_STATES.find(
    (state) => state.toLowerCase() === trimmed.toLowerCase(),
  );
  return ci ?? null;
}

function pickComponent(
  components: GoogleAddressComponent[],
  ...types: string[]
): string {
  for (const type of types) {
    const match = components.find((c) => c.types.includes(type));
    const value = match?.long_name?.trim();
    if (value) return value;
  }
  return "";
}

function uniqueNonEmpty(...values: string[]): string {
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/**
 * Maps Google Geocoding `address_components` into Indian store location fields.
 */
export function parseIndianAddressFromGeocodeResult(result: {
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
}): ParsedGeocodeAddress | null {
  const components = result.address_components ?? [];
  if (components.length === 0 && !result.formatted_address?.trim()) {
    return null;
  }

  const pinCode = pickComponent(components, "postal_code");
  const state =
    normalizeIndianStateName(
      pickComponent(components, "administrative_area_level_1"),
    ) ?? "";

  const admin2 = pickComponent(components, "administrative_area_level_2");
  const admin3 = pickComponent(components, "administrative_area_level_3");
  const locality = pickComponent(components, "locality", "postal_town");
  const sublocality = pickComponent(
    components,
    "sublocality_level_1",
    "sublocality",
  );

  let district = uniqueNonEmpty(admin2, admin3);
  let city = uniqueNonEmpty(locality, sublocality, admin3);

  if (district && city && district.toLowerCase() === city.toLowerCase()) {
    city = uniqueNonEmpty(sublocality, locality, admin3);
  }
  if (!district) {
    district = uniqueNonEmpty(admin3, locality);
  }
  if (!city) {
    city = uniqueNonEmpty(locality, sublocality, district);
  }

  const streetLine = [
    pickComponent(components, "premise"),
    pickComponent(components, "street_number"),
    pickComponent(components, "route"),
    pickComponent(components, "sublocality_level_2"),
    pickComponent(components, "neighborhood"),
  ]
    .filter(Boolean)
    .join(", ");

  const formattedAddress = result.formatted_address?.trim() ?? "";
  const storeAddress = streetLine || formattedAddress;

  return {
    formattedAddress,
    storeAddress,
    state,
    district,
    city,
    pinCode,
  };
}
export type PlacePrediction = {
  placeId: string;
  description: string;
};

export type PlaceAddressFields = {
  formattedAddress?: string;
  storeAddress?: string;
  state?: string;
  district?: string;
  city?: string;
  pinCode?: string;
};

export type PlaceCoordinates = {
  latitude: number;
  longitude: number;
} & PlaceAddressFields;

function hasPlaceAddressFields(
  fields: PlaceAddressFields | null | undefined,
): fields is PlaceAddressFields {
  if (!fields) return false;
  return Boolean(
    fields.storeAddress?.trim() ||
      fields.formattedAddress?.trim() ||
      fields.state?.trim() ||
      fields.district?.trim() ||
      fields.city?.trim() ||
      fields.pinCode?.trim(),
  );
}

/** Google Places Autocomplete + Details + Geocoding (REST, mirrors Flutter). */
export async function autocompletePlaces(
  input: string,
): Promise<PlacePrediction[]> {
  const query = input.trim();
  if (query.length < 2) return [];

  const params = new URLSearchParams({ input: query });
  const response = await fetch(`/api/places/autocomplete?${params}`);
  if (!response.ok) return [];

  const json = (await response.json()) as { predictions?: PlacePrediction[] };
  return json.predictions ?? [];
}

export async function placeDetailsCoordinates(
  placeId: string,
): Promise<PlaceCoordinates | null> {
  if (!placeId) return null;

  const params = new URLSearchParams({ placeId });
  const response = await fetch(`/api/places/details?${params}`);
  if (!response.ok) return null;

  const json = (await response.json()) as {
    coordinates: PlaceCoordinates | null;
  };
  return json.coordinates;
}

export async function geocodeAddress(
  address: string,
): Promise<PlaceCoordinates | null> {
  const query = address.trim();
  if (!query) return null;

  const params = new URLSearchParams({ address: query });
  const response = await fetch(`/api/places/geocode?${params}`);
  if (!response.ok) return null;

  const json = (await response.json()) as {
    coordinates: PlaceCoordinates | null;
  };
  return json.coordinates;
}

export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number,
): Promise<PlaceAddressFields | null> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const params = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
  });
  const response = await fetch(`/api/places/reverse-geocode?${params}`);
  if (!response.ok) return null;

  const json = (await response.json()) as {
    address:
      | (PlaceAddressFields & { latitude?: number; longitude?: number })
      | null;
  };

  if (!json.address || !hasPlaceAddressFields(json.address)) {
    return null;
  }

  return {
    formattedAddress: json.address.formattedAddress,
    storeAddress: json.address.storeAddress,
    state: json.address.state,
    district: json.address.district,
    city: json.address.city,
    pinCode: json.address.pinCode,
  };
}

export { hasPlaceAddressFields };

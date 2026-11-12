export type PlacePrediction = {
  placeId: string;
  description: string;
};

export type PlaceCoordinates = {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
};

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

import { NextResponse, type NextRequest } from "next/server";

import { googleMapsApiKey } from "@/config/google-maps-config";
import { parseIndianAddressFromGeocodeResult } from "@/features/onboarding/utils/parse-geocode-address";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId")?.trim() ?? "";
  if (!placeId) {
    return NextResponse.json({ coordinates: null });
  }

  const params = new URLSearchParams({
    place_id: placeId,
    fields: "geometry,formatted_address,address_components",
    key: googleMapsApiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
  );
  if (!response.ok) {
    return NextResponse.json({ coordinates: null });
  }

  const json = (await response.json()) as {
    status?: string;
    result?: {
      formatted_address?: string;
      geometry?: { location?: { lat?: number; lng?: number } };
      address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>;
    };
  };

  if (json.status !== "OK") {
    return NextResponse.json({ coordinates: null });
  }

  const lat = json.result?.geometry?.location?.lat;
  const lng = json.result?.geometry?.location?.lng;
  if (lat == null || lng == null) {
    return NextResponse.json({ coordinates: null });
  }

  const parsed = parseIndianAddressFromGeocodeResult({
    formatted_address: json.result?.formatted_address,
    address_components: json.result?.address_components,
  });

  return NextResponse.json({
    coordinates: {
      latitude: lat,
      longitude: lng,
      formattedAddress: json.result?.formatted_address,
      storeAddress: parsed?.storeAddress,
      state: parsed?.state,
      district: parsed?.district,
      city: parsed?.city,
      pinCode: parsed?.pinCode,
    },
  });
}

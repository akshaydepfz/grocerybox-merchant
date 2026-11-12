import { NextResponse, type NextRequest } from "next/server";

import { googleMapsApiKey } from "@/config/google-maps-config";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId")?.trim() ?? "";
  if (!placeId) {
    return NextResponse.json({ coordinates: null });
  }

  const params = new URLSearchParams({
    place_id: placeId,
    fields: "geometry,formatted_address",
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

  return NextResponse.json({
    coordinates: {
      latitude: lat,
      longitude: lng,
      formattedAddress: json.result?.formatted_address,
    },
  });
}

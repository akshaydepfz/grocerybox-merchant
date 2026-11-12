import { NextResponse, type NextRequest } from "next/server";

import { googleMapsApiKey } from "@/config/google-maps-config";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim() ?? "";
  if (!address) {
    return NextResponse.json({ coordinates: null });
  }

  const params = new URLSearchParams({
    address,
    key: googleMapsApiKey,
    components: "country:IN",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`,
  );
  if (!response.ok) {
    return NextResponse.json({ coordinates: null });
  }

  const json = (await response.json()) as {
    status?: string;
    results?: Array<{
      formatted_address?: string;
      geometry?: { location?: { lat?: number; lng?: number } };
    }>;
  };

  if (json.status !== "OK" || !json.results?.length) {
    return NextResponse.json({ coordinates: null });
  }

  const first = json.results[0];
  const lat = first.geometry?.location?.lat;
  const lng = first.geometry?.location?.lng;
  if (lat == null || lng == null) {
    return NextResponse.json({ coordinates: null });
  }

  return NextResponse.json({
    coordinates: {
      latitude: lat,
      longitude: lng,
      formattedAddress: first.formatted_address,
    },
  });
}

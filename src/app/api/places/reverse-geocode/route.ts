import { NextResponse, type NextRequest } from "next/server";

import { googleMapsApiKey } from "@/config/google-maps-config";
import { parseIndianAddressFromGeocodeResult } from "@/features/onboarding/utils/parse-geocode-address";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  const latitude = lat != null ? Number(lat) : NaN;
  const longitude = lng != null ? Number(lng) : NaN;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ address: null });
  }

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: googleMapsApiKey,
    region: "in",
    language: "en",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`,
  );
  if (!response.ok) {
    return NextResponse.json({ address: null });
  }

  const json = (await response.json()) as {
    status?: string;
    results?: Array<{
      formatted_address?: string;
      address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>;
    }>;
  };

  if (json.status !== "OK" || !json.results?.length) {
    return NextResponse.json({ address: null });
  }

  const parsed =
    parseIndianAddressFromGeocodeResult(json.results[0]) ??
    parseIndianAddressFromGeocodeResult(
      json.results.find((r) => r.address_components?.length) ?? json.results[0],
    );

  if (!parsed) {
    return NextResponse.json({ address: null });
  }

  return NextResponse.json({
    address: {
      ...parsed,
      latitude,
      longitude,
    },
  });
}
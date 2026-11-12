import { NextResponse, type NextRequest } from "next/server";

import { googleMapsApiKey } from "@/config/google-maps-config";

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("input")?.trim() ?? "";
  if (input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const params = new URLSearchParams({
    input,
    key: googleMapsApiKey,
    components: "country:in",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`,
  );
  if (!response.ok) {
    return NextResponse.json({ predictions: [] });
  }

  const json = (await response.json()) as {
    status?: string;
    predictions?: Array<{ place_id?: string; description?: string }>;
  };

  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    return NextResponse.json({ predictions: [] });
  }

  const predictions = (json.predictions ?? [])
    .map((p) => ({
      placeId: p.place_id ?? "",
      description: p.description ?? "",
    }))
    .filter((p) => p.placeId.length > 0);

  return NextResponse.json({ predictions });
}

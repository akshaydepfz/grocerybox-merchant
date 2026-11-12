/**
 * Google Maps / Places (mirrors Flutter `GoogleMapsConfig`).
 * Restrict the key in Google Cloud Console (HTTP referrers).
 */
const flutterDevKey = "AIzaSyD6kQzgwCSkSFzwLA-UhPAFBU1s0yCnLfA";

export const googleMapsApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || flutterDevKey;

/** Default map centre (Kozhikode) when GPS is unavailable. */
export const GOOGLE_MAPS_DEFAULT_LATITUDE = 11.2588;
export const GOOGLE_MAPS_DEFAULT_LONGITUDE = 75.7804;

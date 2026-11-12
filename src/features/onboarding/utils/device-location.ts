import { roundMapCoordinate } from "../validators/store-location-validator";

export type DeviceLocationResult =
  | { success: true; latitude: number; longitude: number }
  | { success: false; errorMessage: string };

export function getBrowserCurrentPosition(
  timeoutMs = 15_000,
): Promise<DeviceLocationResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({
      success: false,
      errorMessage:
        "Location is not available in this browser. Set your pin on the map.",
    });
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      resolve({
        success: false,
        errorMessage:
          "Unable to get current location. Try again or set the pin on the map.",
      });
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timer);
        resolve({
          success: true,
          latitude: roundMapCoordinate(position.coords.latitude),
          longitude: roundMapCoordinate(position.coords.longitude),
        });
      },
      (error) => {
        window.clearTimeout(timer);
        if (error.code === error.PERMISSION_DENIED) {
          resolve({
            success: false,
            errorMessage:
              "Location permission denied. You can still set your pin on the map.",
          });
          return;
        }
        resolve({
          success: false,
          errorMessage:
            "Unable to get current location. Try again or set the pin on the map.",
        });
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}

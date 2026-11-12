"use client";

import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import {
  GOOGLE_MAPS_DEFAULT_LATITUDE,
  GOOGLE_MAPS_DEFAULT_LONGITUDE,
  googleMapsApiKey,
  googleMapsMapId,
} from "@/config/google-maps-config";

type StoreLocationMapInnerProps = {
  latitude: number;
  longitude: number;
  enabled: boolean;
  onLocationChanged: (latitude: number, longitude: number) => void;
};

function MapCameraSync({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: latitude, lng: longitude });
  }, [latitude, longitude, map]);
  return null;
}

export function StoreLocationMapInner({
  latitude,
  longitude,
  enabled,
  onLocationChanged,
}: StoreLocationMapInnerProps) {
  if (!googleMapsApiKey) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-gb-mo-gray-200 bg-gb-mo-gray-50 text-xs text-gb-mo-gray-500">
        Google Maps API key is not configured.
      </div>
    );
  }

  return (
    <APIProvider apiKey={googleMapsApiKey} libraries={["marker"]}>
      <Map
        mapId={googleMapsMapId}
        defaultCenter={{
          lat: latitude || GOOGLE_MAPS_DEFAULT_LATITUDE,
          lng: longitude || GOOGLE_MAPS_DEFAULT_LONGITUDE,
        }}
        defaultZoom={15}
        gestureHandling={enabled ? "greedy" : "none"}
        disableDefaultUI
        clickableIcons={false}
        className="h-[300px] w-full"
        onClick={
          enabled
            ? (event) => {
                const latLng = event.detail.latLng;
                if (!latLng) return;
                onLocationChanged(latLng.lat, latLng.lng);
              }
            : undefined
        }
      >
        <MapCameraSync latitude={latitude} longitude={longitude} />
        <AdvancedMarker
          position={{ lat: latitude, lng: longitude }}
          draggable={enabled}
          onDragEnd={
            enabled
              ? (event) => {
                  const latLng = event.latLng;
                  if (!latLng) return;
                  onLocationChanged(latLng.lat(), latLng.lng());
                }
              : undefined
          }
        >
          <Pin
            background="#22C55E"
            borderColor="#15803D"
            glyphColor="#FFFFFF"
          />
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
}

export function MapLoadingPlaceholder() {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-2xl border border-gb-mo-gray-200 bg-gb-mo-gray-50">
      <Loader2 className="size-6 animate-spin text-gb-mo-gray-400" />
    </div>
  );
}

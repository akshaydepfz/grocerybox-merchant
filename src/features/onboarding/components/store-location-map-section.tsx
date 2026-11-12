"use client";

import { Loader2, LocateFixed, MapPin, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  autocompletePlaces,
  geocodeAddress,
  placeDetailsCoordinates,
  type PlacePrediction,
} from "../services/google-places-service";
import { roundMapCoordinate } from "../validators/store-location-validator";

import { MerchantFieldLabel } from "./merchant-form-fields";
import { MapLoadingPlaceholder } from "./store-location-map-inner";

const StoreLocationMapInner = dynamic(
  () =>
    import("./store-location-map-inner").then((m) => m.StoreLocationMapInner),
  { ssr: false, loading: () => <MapLoadingPlaceholder /> },
);

type StoreLocationMapSectionProps = {
  latitude: number;
  longitude: number;
  enabled: boolean;
  isFetchingLocation: boolean;
  onLocationChanged: (latitude: number, longitude: number) => void;
  onUseCurrentLocation: () => void;
};

export function StoreLocationMapSection({
  latitude,
  longitude,
  enabled,
  isFetchingLocation,
  onLocationChanged,
  onUseCurrentLocation,
}: StoreLocationMapSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setShowPredictions(true);

    debounceRef.current = setTimeout(() => {
      void (async () => {
        const results = await autocompletePlaces(value);
        setPredictions(results);
        setSearchLoading(false);
      })();
    }, 350);
  };

  const applyCoordinates = (lat: number, lng: number) => {
    onLocationChanged(roundMapCoordinate(lat), roundMapCoordinate(lng));
  };

  const selectPrediction = async (prediction: PlacePrediction) => {
    setShowPredictions(false);
    setPredictions([]);
    setSearchText(prediction.description);

    const coords = await placeDetailsCoordinates(prediction.placeId);
    if (!coords) return;
    applyCoordinates(coords.latitude, coords.longitude);
  };

  const handleSearchSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const query = searchText.trim();
    if (!query || !enabled) return;

    setShowPredictions(false);
    setSearchLoading(true);
    const coords = await geocodeAddress(query);
    setSearchLoading(false);

    if (!coords) {
      toast.error("Location not found. Try a different search.");
      return;
    }

    applyCoordinates(coords.latitude, coords.longitude);
  };

  return (
    <section className="flex flex-col gap-3">
      <div>
        <div className="flex items-center gap-1.5">
          <MapPin className="size-4 text-gb-mo-gray-900" />
          <p className="text-xs font-bold text-gb-mo-gray-900">
            Map Location <span className="text-red-600">*</span>
          </p>
        </div>
        <p className="mt-0.5 pl-[22px] text-xs text-gb-mo-gray-500">
          Search or tap the map to set your store pin. We use this for deliveries.
        </p>
      </div>

      <div>
        <MerchantFieldLabel label="Search location" />
        <form onSubmit={(e) => void handleSearchSubmit(e)} className="mt-1.5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-gb-mo-gray-400" />
            <Input
              value={searchText}
              onChange={(e) => enabled && handleSearchChange(e.target.value)}
              readOnly={!enabled}
              placeholder="Search for area, street or landmark"
              className="h-auto rounded-xl border-gb-mo-input-border py-3 pl-9 text-xs text-gb-mo-gray-700"
            />
          </div>
        </form>

        {showPredictions && predictions.length > 0 ? (
          <ul className="mt-1 max-h-[200px] overflow-y-auto rounded-xl border border-gb-mo-gray-200 bg-white shadow-sm">
            {predictions.map((item, index) => (
              <li key={item.placeId}>
                {index > 0 ? (
                  <hr className="border-gb-mo-gray-100" />
                ) : null}
                <button
                  type="button"
                  disabled={!enabled}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-[13px] text-gb-mo-gray-800",
                    enabled && "hover:bg-gb-mo-gray-50",
                  )}
                  onClick={() => void selectPrediction(item)}
                >
                  {item.description}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {searchLoading ? (
          <div className="mt-2 h-0.5 w-full overflow-hidden rounded bg-gb-mo-gray-100">
            <div className="h-full w-1/3 animate-pulse bg-gb-mo-brand-dark" />
          </div>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <StoreLocationMapInner
          latitude={latitude}
          longitude={longitude}
          enabled={enabled}
          onLocationChanged={onLocationChanged}
        />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
        <button
          type="button"
          disabled={!enabled || isFetchingLocation}
          onClick={onUseCurrentLocation}
          className={cn(
            "pointer-events-auto absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-gb-mo-gray-200 bg-white/95 px-3.5 py-2.5 text-xs font-semibold text-gb-mo-gray-900 shadow-sm",
            (!enabled || isFetchingLocation) && "opacity-60",
          )}
        >
          {isFetchingLocation ? (
            <Loader2 className="size-4 animate-spin text-gb-mo-gray-700" />
          ) : (
            <LocateFixed className="size-4" />
          )}
          {isFetchingLocation ? "Getting location..." : "Use My Current Location"}
        </button>
      </div>
    </section>
  );
}

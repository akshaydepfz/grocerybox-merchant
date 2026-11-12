"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  GOOGLE_MAPS_DEFAULT_LATITUDE,
  GOOGLE_MAPS_DEFAULT_LONGITUDE,
} from "@/config/google-maps-config";
import { useAuth } from "@/features/auth/components/auth-provider";
import { AuthError, resolveSignedInEmail } from "@/features/auth/services/auth-service";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ApiError } from "@/lib/api/types";

import { saveStoreLocation, fetchStoreLocation } from "../services/store-location-service";
import type { StoreLocationData } from "../types/store-location";
import { getBrowserCurrentPosition } from "../utils/device-location";
import {
  STORE_LOCATION_ALLOWED_CITIES,
  STORE_LOCATION_ALLOWED_DISTRICTS,
  STORE_LOCATION_ALLOWED_STATES,
  defaultStoreLocationFormState,
  normalizeAndValidateStoreLocation,
  roundMapCoordinate,
} from "../validators/store-location-validator";

import {
  MerchantCompactSelect,
  MerchantFieldLabel,
  MerchantIconTextField,
} from "./merchant-form-fields";
import {
  MerchantOnboardingScreenLayout,
  OnboardingFormFooter,
  OnboardingStepProgress,
} from "./merchant-onboarding-layout";
import { StoreLocationMapSection } from "./store-location-map-section";

const STORE_BRANDING_PATH = "/onboarding/store-branding";
const STORE_CONFIG_PATH = "/onboarding/store-config";
const CONTINUE_LIME_CLASS = "bg-[#C4F82A]";

function applyLoadedLocation(
  data: StoreLocationData,
  setForm: React.Dispatch<
    React.SetStateAction<ReturnType<typeof defaultStoreLocationFormState>>
  >,
  setMapCoords: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number; hasPin: boolean }>
  >,
) {
  const loc = data.location;
  setForm((prev) => ({
    storeAddress: loc.storeAddress || prev.storeAddress,
    pinCode: loc.pinCode || prev.pinCode,
    state:
      loc.state && STORE_LOCATION_ALLOWED_STATES.includes(
        loc.state as (typeof STORE_LOCATION_ALLOWED_STATES)[number],
      )
        ? loc.state
        : prev.state,
    district:
      loc.district &&
      STORE_LOCATION_ALLOWED_DISTRICTS.includes(
        loc.district as (typeof STORE_LOCATION_ALLOWED_DISTRICTS)[number],
      )
        ? loc.district
        : prev.district,
    city:
      loc.city &&
      STORE_LOCATION_ALLOWED_CITIES.includes(
        loc.city as (typeof STORE_LOCATION_ALLOWED_CITIES)[number],
      )
        ? loc.city
        : prev.city,
  }));

  if (loc.latitude != null && loc.longitude != null) {
    setMapCoords({
      lat: loc.latitude,
      lng: loc.longitude,
      hasPin: true,
    });
  }
}

export function StoreLocationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const signedInEmail = resolveSignedInEmail(user?.email);
  const twoCol = useMediaQuery("(min-width: 480px)");

  const userModifiedRef = useRef(false);
  const autoGpsAttemptedRef = useRef(false);
  const isApplyingLoadRef = useRef(false);

  const [formValues, setFormValues] = useState(defaultStoreLocationFormState);
  const [mapCoords, setMapCoords] = useState({
    lat: GOOGLE_MAPS_DEFAULT_LATITUDE,
    lng: GOOGLE_MAPS_DEFAULT_LONGITUDE,
    hasPin: false,
  });
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const loadQuery = useQuery({
    queryKey: ["merchant-store-location"],
    queryFn: fetchStoreLocation,
    enabled: Boolean(user),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!loadQuery.data || userModifiedRef.current) {
      return;
    }
    isApplyingLoadRef.current = true;
    applyLoadedLocation(loadQuery.data, setFormValues, setMapCoords);
    isApplyingLoadRef.current = false;
  }, [loadQuery.data]);

  useEffect(() => {
    if (loadQuery.error) {
      const err = loadQuery.error;
      if (err instanceof ApiError && err.status === 404) return;
      toast.error(
        err instanceof ApiError ? err.message : "Unable to load store location.",
      );
    }
  }, [loadQuery.error]);

  const requestCurrentLocation = useCallback(async (showError: boolean) => {
    if (isFetchingLocation) return;
    setIsFetchingLocation(true);
    const result = await getBrowserCurrentPosition();
    setIsFetchingLocation(false);

    if (!result.success) {
      if (showError) {
        toast.error(result.errorMessage);
      }
      return;
    }

    if (!isApplyingLoadRef.current) {
      userModifiedRef.current = true;
    }
    setMapCoords({
      lat: result.latitude,
      lng: result.longitude,
      hasPin: true,
    });
  }, [isFetchingLocation]);

  useEffect(() => {
    if (
      loadQuery.isLoading ||
      autoGpsAttemptedRef.current ||
      mapCoords.hasPin
    ) {
      return;
    }
    autoGpsAttemptedRef.current = true;
    void requestCurrentLocation(false);
  }, [loadQuery.isLoading, mapCoords.hasPin, requestCurrentLocation]);

  const patchForm = (patch: Partial<typeof formValues>) => {
    if (!isApplyingLoadRef.current) {
      userModifiedRef.current = true;
    }
    setFormValues((prev) => ({ ...prev, ...patch }));
  };

  const onMapLocationChanged = (latitude: number, longitude: number) => {
    userModifiedRef.current = true;
    setMapCoords({
      lat: roundMapCoordinate(latitude),
      lng: roundMapCoordinate(longitude),
      hasPin: true,
    });
  };

  const saveMutation = useMutation({
    mutationFn: saveStoreLocation,
  });

  const busy = loadQuery.isLoading || saveMutation.isPending;

  const handleContinue = async () => {
    if (busy) return;

    const validated = normalizeAndValidateStoreLocation({
      ...formValues,
      latitude: mapCoords.lat,
      longitude: mapCoords.lng,
    });

    if (validated.error) {
      toast.error(validated.error);
      return;
    }
    if (!validated.values) {
      toast.error("Unable to save store location.");
      return;
    }

    try {
      await saveMutation.mutateAsync(validated.values);
      router.push(STORE_CONFIG_PATH);
    } catch (error) {
      toast.error(
        error instanceof AuthError || error instanceof ApiError
          ? error.message
          : "Unable to save store location.",
      );
    }
  };

  return (
    <MerchantOnboardingScreenLayout
      signedInEmail={signedInEmail}
      currentStep={4}
      footer={
        <OnboardingFormFooter
          onBack={busy ? undefined : () => router.push(STORE_BRANDING_PATH)}
          onContinue={() => void handleContinue()}
          isContinueLoading={saveMutation.isPending}
          continueColor={CONTINUE_LIME_CLASS}
        />
      }
    >
      <OnboardingStepProgress currentStep={4} />
      <h1 className="mt-5 text-[28px] font-extrabold tracking-tight text-gb-mo-gray-900">
        Store Location
      </h1>
      <p className="mt-1 text-sm font-medium text-gb-mo-gray-500">
        Add your store address and service location for delivery and pickup.
      </p>

      {loadQuery.isLoading ? (
        <span
          aria-hidden
          className="mt-4 block h-0.5 w-full bg-gb-mo-progress-track"
        />
      ) : null}

      <section className="mt-7 max-w-2xl space-y-4">
        <div>
          <MerchantFieldLabel label="Store Address" required />
          <MerchantIconTextField
            icon={MapPin}
            value={formValues.storeAddress}
            onChange={(e) => patchForm({ storeAddress: e.target.value })}
            placeholder="Enter full address"
            readOnly={busy}
          />
        </div>

        <div className={twoCol ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
          <MerchantCompactSelect
            label="State"
            required
            value={formValues.state}
            onValueChange={(state) => patchForm({ state })}
            items={STORE_LOCATION_ALLOWED_STATES}
          />
          <MerchantCompactSelect
            label="District"
            required
            value={formValues.district}
            onValueChange={(district) => patchForm({ district })}
            items={STORE_LOCATION_ALLOWED_DISTRICTS}
          />
        </div>

        <div className={twoCol ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
          <MerchantCompactSelect
            label="City / Town"
            required
            value={formValues.city}
            onValueChange={(city) => patchForm({ city })}
            items={STORE_LOCATION_ALLOWED_CITIES}
          />
          <div>
            <MerchantFieldLabel label="PIN Code" required />
            <MerchantIconTextField
              icon={Building2}
              inputMode="numeric"
              value={formValues.pinCode}
              onChange={(e) => patchForm({ pinCode: e.target.value })}
              readOnly={busy}
            />
          </div>
        </div>

        <StoreLocationMapSection
          latitude={mapCoords.lat}
          longitude={mapCoords.lng}
          enabled={!busy}
          isFetchingLocation={isFetchingLocation}
          onLocationChanged={onMapLocationChanged}
          onUseCurrentLocation={() => void requestCurrentLocation(true)}
        />
      </section>
    </MerchantOnboardingScreenLayout>
  );
}

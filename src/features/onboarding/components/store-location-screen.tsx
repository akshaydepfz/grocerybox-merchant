"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, LandPlot, LocateFixed, MapPin } from "lucide-react";
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

import {
  INDIAN_STATE_OPTIONS,
  isIndianState,
} from "../constants/indian-states";
import {
  hasPlaceAddressFields,
  reverseGeocodeCoordinates,
  type PlaceAddressFields,
} from "../services/google-places-service";
import { saveStoreLocation, fetchStoreLocation } from "../services/store-location-service";
import type { StoreLocationData } from "../types/store-location";
import { getBrowserCurrentPosition } from "../utils/device-location";
import {
  defaultStoreLocationFormState,
  normalizeAndValidateStoreLocation,
  roundMapCoordinate,
} from "../validators/store-location-validator";

import {
  MerchantFieldBlock,
  MerchantFieldLabel,
  MerchantIconSelect,
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
      loc.state?.trim() && isIndianState(loc.state.trim())
        ? loc.state.trim()
        : prev.state,
    district: loc.district?.trim() ?? prev.district,
    city: loc.city?.trim() ?? prev.city,
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
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

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

  const mergeAddressFields = useCallback(
    (
      prev: ReturnType<typeof defaultStoreLocationFormState>,
      fields: PlaceAddressFields,
    ) => {
      const storeAddress =
        fields.storeAddress?.trim() ||
        fields.formattedAddress?.trim() ||
        prev.storeAddress;
      const state =
        fields.state?.trim() && isIndianState(fields.state.trim())
          ? fields.state.trim()
          : prev.state;
      return {
        ...prev,
        storeAddress,
        state,
        district: fields.district?.trim() || prev.district,
        city: fields.city?.trim() || prev.city,
        pinCode: fields.pinCode?.trim() || prev.pinCode,
      };
    },
    [],
  );

  const applyMapPin = useCallback(
    async (
      latitude: number,
      longitude: number,
      prefilled?: PlaceAddressFields | null,
    ) => {
      const lat = roundMapCoordinate(latitude);
      const lng = roundMapCoordinate(longitude);

      if (!isApplyingLoadRef.current) {
        userModifiedRef.current = true;
      }
      setMapCoords({ lat, lng, hasPin: true });

      let fields = prefilled;
      if (!hasPlaceAddressFields(fields)) {
        setIsResolvingAddress(true);
        try {
          fields = await reverseGeocodeCoordinates(lat, lng);
        } finally {
          setIsResolvingAddress(false);
        }
      }

      if (hasPlaceAddressFields(fields)) {
        setFormValues((prev) => mergeAddressFields(prev, fields));
      }
    },
    [mergeAddressFields],
  );

  const requestCurrentLocation = useCallback(
    async (showError: boolean) => {
      if (isFetchingLocation || isResolvingAddress) return;
      setIsFetchingLocation(true);
      const result = await getBrowserCurrentPosition();
      setIsFetchingLocation(false);

      if (!result.success) {
        if (showError) {
          toast.error(result.errorMessage);
        }
        return;
      }

      await applyMapPin(result.latitude, result.longitude);
    },
    [applyMapPin, isFetchingLocation, isResolvingAddress],
  );

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

  const onMapLocationChanged = (
    latitude: number,
    longitude: number,
    addressFields?: PlaceAddressFields | null,
  ) => {
    void applyMapPin(latitude, longitude, addressFields);
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
        <StoreLocationMapSection
          latitude={mapCoords.lat}
          longitude={mapCoords.lng}
          enabled={!busy}
          isFetchingLocation={isFetchingLocation || isResolvingAddress}
          onLocationChanged={onMapLocationChanged}
          onUseCurrentLocation={() => void requestCurrentLocation(true)}
        />

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
          <MerchantFieldBlock label="State" required>
            <MerchantIconSelect
              icon={MapPin}
              value={formValues.state}
              onValueChange={(state) => patchForm({ state })}
              placeholder="Select state"
              items={INDIAN_STATE_OPTIONS}
            />
          </MerchantFieldBlock>
          <MerchantFieldBlock label="District" required>
            <MerchantIconTextField
              icon={LandPlot}
              value={formValues.district}
              onChange={(e) => patchForm({ district: e.target.value })}
              placeholder="e.g. Kozhikode"
              readOnly={busy}
            />
          </MerchantFieldBlock>
        </div>

        <div className={twoCol ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
          <MerchantFieldBlock label="City / Town" required>
            <MerchantIconTextField
              icon={Building2}
              value={formValues.city}
              onChange={(e) => patchForm({ city: e.target.value })}
              placeholder="e.g. Kozhikode"
              readOnly={busy}
            />
          </MerchantFieldBlock>
          <MerchantFieldBlock label="PIN Code" required>
            <MerchantIconTextField
              icon={LocateFixed}
              inputMode="numeric"
              value={formValues.pinCode}
              onChange={(e) => patchForm({ pinCode: e.target.value })}
              placeholder="6-digit PIN"
              readOnly={busy}
            />
          </MerchantFieldBlock>
        </div>
      </section>
    </MerchantOnboardingScreenLayout>
  );
}

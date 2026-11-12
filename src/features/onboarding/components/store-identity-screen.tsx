"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/components/auth-provider";
import { AuthError, resolveSignedInEmail } from "@/features/auth/services/auth-service";
import { ApiError } from "@/lib/api/types";

import { useSlugAvailability } from "../hooks/use-slug-availability";
import {
  createStore,
  fetchStore,
  updateStore,
} from "../services/store-identity-service";
import {
  defaultStoreIdentityFormValues,
  type StoreIdentityData,
  type StoreIdentityFormValues,
} from "../types/store-identity";
import {
  normalizeAndValidateStoreIdentity,
  slugifyStoreName,
} from "../validators/store-identity-validator";

import {
  MerchantOnboardingScreenLayout,
  OnboardingFormFooter,
  OnboardingStepProgress,
} from "./merchant-onboarding-layout";
import { StoreIdentityForm } from "./store-identity-form";

const MERCHANT_DETAILS_PATH = "/onboarding/merchant-details";
const STORE_BRANDING_PATH = "/onboarding/store-branding";

function dataToFormValues(data: StoreIdentityData): StoreIdentityFormValues {
  return {
    storeName: data.storeName,
    subdomain: data.subdomain,
    description: data.description,
  };
}

export function StoreIdentityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const signedInEmail = resolveSignedInEmail(user?.email);
  const userModifiedRef = useRef(false);
  const autoSyncSubdomainRef = useRef(true);
  const hasExistingStoreRef = useRef(false);

  const [formValues, setFormValues] = useState<StoreIdentityFormValues>(
    defaultStoreIdentityFormValues,
  );

  const {
    availability,
    availabilityFor,
    scheduleCheck,
    canSubmitSlug,
    markUnavailable,
  } = useSlugAvailability();

  const loadQuery = useQuery({
    queryKey: ["merchant-store"],
    queryFn: fetchStore,
    enabled: Boolean(user),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!loadQuery.data || userModifiedRef.current) {
      return;
    }
    autoSyncSubdomainRef.current = false;
    hasExistingStoreRef.current = true;
    const values = dataToFormValues(loadQuery.data);
    setFormValues(values);
    scheduleCheck(values.subdomain);
  }, [loadQuery.data, scheduleCheck]);

  const patchForm = useCallback(
    (patch: Partial<StoreIdentityFormValues>) => {
      userModifiedRef.current = true;
      setFormValues((prev) => {
        const next = { ...prev, ...patch };
        if (
          patch.storeName !== undefined &&
          autoSyncSubdomainRef.current
        ) {
          const slug = slugifyStoreName(patch.storeName);
          if (slug.length > 0) {
            next.subdomain = slug;
            scheduleCheck(slug);
          }
        }
        if (patch.subdomain !== undefined) {
          autoSyncSubdomainRef.current = false;
          scheduleCheck(patch.subdomain);
        }
        return next;
      });
    },
    [scheduleCheck],
  );

  const saveMutation = useMutation({
    mutationFn: async (values: StoreIdentityFormValues) => {
      if (hasExistingStoreRef.current) {
        await updateStore(values);
      } else {
        await createStore(values);
        hasExistingStoreRef.current = true;
      }
    },
  });

  const handleContinue = useCallback(async () => {
    if (saveMutation.isPending) {
      return;
    }

    const validated = normalizeAndValidateStoreIdentity(formValues);
    if (validated.error) {
      toast.error(validated.error);
      return;
    }
    if (!validated.values) {
      toast.error("Unable to save store identity.");
      return;
    }

    if (
      availabilityFor !== validated.values.subdomain ||
      !canSubmitSlug
    ) {
      scheduleCheck(validated.values.subdomain);
      toast.error("Please wait for subdomain availability to be confirmed.");
      return;
    }

    try {
      await saveMutation.mutateAsync(validated.values);
      router.push(STORE_BRANDING_PATH);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        markUnavailable();
        toast.error("This subdomain is already taken.");
        return;
      }
      const message =
        error instanceof AuthError || error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to save store identity.";
      toast.error(message);
    }
  }, [
    availabilityFor,
    canSubmitSlug,
    formValues,
    markUnavailable,
    router,
    saveMutation,
    scheduleCheck,
  ]);

  return (
    <MerchantOnboardingScreenLayout
      signedInEmail={signedInEmail}
      currentStep={2}
      footer={
        <OnboardingFormFooter
          onBack={() => router.push(MERCHANT_DETAILS_PATH)}
          onContinue={() => void handleContinue()}
          isContinueLoading={saveMutation.isPending}
          continueColor="bg-gb-onboard-accent"
        />
      }
    >
      <OnboardingStepProgress currentStep={2} useGradient />
      <h1 className="mt-5 text-[28px] font-extrabold tracking-tight text-gb-mo-gray-900">
        Store Identity
      </h1>
      <p className="mt-1 text-sm text-gb-mo-gray-500">
        Create your online store&apos;s identity and web address.
      </p>
      {loadQuery.isLoading ? (
        <span aria-hidden className="mt-4 block h-0.5 w-full bg-gb-mo-progress-track" />
      ) : null}
      <section className="mt-7">
        <StoreIdentityForm
          storeName={formValues.storeName}
          subdomain={formValues.subdomain}
          description={formValues.description}
          onStoreNameChange={(storeName) => patchForm({ storeName })}
          onSubdomainChange={(subdomain) => patchForm({ subdomain })}
          onDescriptionChange={(description) => patchForm({ description })}
          slugAvailability={availability}
        />
      </section>
    </MerchantOnboardingScreenLayout>
  );
}

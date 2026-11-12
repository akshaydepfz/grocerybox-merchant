"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/components/auth-provider";
import { AuthError, resolveSignedInEmail } from "@/features/auth/services/auth-service";
import { ApiError } from "@/lib/api/types";

import {
  fetchBusiness,
  saveBusiness,
} from "../services/business-information-service";
import {
  defaultBusinessFormValues,
  type BusinessInformationData,
  type BusinessInformationFormValues,
} from "../types/business-information";
import { normalizeAndValidateBusinessInformation } from "../validators/business-information-validator";

import { BusinessInformationForm } from "./business-information-form";
import {
  MerchantOnboardingScreenLayout,
  OnboardingFormFooter,
  OnboardingStepProgress,
} from "./merchant-onboarding-layout";

const STORE_IDENTITY_PATH = "/onboarding/store-identity";

function dataToFormValues(data: BusinessInformationData): BusinessInformationFormValues {
  return {
    businessName: data.businessName,
    businessType: data.businessType || null,
    ownerFullName: data.ownerFullName,
    mobileNumber: data.mobileNumber,
    email: data.email,
    gstin: data.gstin,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    state: data.state || "Kerala",
    district: data.district || "Kozhikode",
    city: data.city || "Kozhikode",
    pinCode: data.pinCode || "673001",
  };
}

export function MerchantDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const signedInEmail = resolveSignedInEmail(user?.email);
  const userModifiedRef = useRef(false);

  const [formValues, setFormValues] = useState<BusinessInformationFormValues>(
    () => defaultBusinessFormValues(signedInEmail),
  );

  useEffect(() => {
    if (!userModifiedRef.current) {
      setFormValues((prev) => ({ ...prev, email: signedInEmail }));
    }
  }, [signedInEmail]);

  const loadQuery = useQuery({
    queryKey: ["merchant-business"],
    queryFn: fetchBusiness,
    enabled: Boolean(user),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!loadQuery.data || userModifiedRef.current) {
      return;
    }
    setFormValues(dataToFormValues(loadQuery.data));
  }, [loadQuery.data]);

  const patchForm = useCallback((patch: Partial<BusinessInformationFormValues>) => {
    userModifiedRef.current = true;
    setFormValues((prev) => ({ ...prev, ...patch }));
  }, []);

  const saveMutation = useMutation({
    mutationFn: saveBusiness,
  });

  const handleContinue = useCallback(async () => {
    if (saveMutation.isPending) {
      return;
    }

    const merchantEmail = resolveSignedInEmail(user?.email);
    const validated = normalizeAndValidateBusinessInformation(
      formValues,
      merchantEmail,
    );

    if (validated.error) {
      toast.error(validated.error);
      return;
    }

    if (!validated.values) {
      toast.error("Unable to save business information.");
      return;
    }

    try {
      await saveMutation.mutateAsync(validated.values);
      router.push(STORE_IDENTITY_PATH);
    } catch (error) {
      const message =
        error instanceof AuthError || error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Unable to save business information.";
      toast.error(message);
    }
  }, [formValues, router, saveMutation, user?.email]);

  return (
    <MerchantOnboardingScreenLayout
      signedInEmail={signedInEmail}
      currentStep={1}
      footer={
        <OnboardingFormFooter
          onContinue={() => void handleContinue()}
          isContinueLoading={saveMutation.isPending}
        />
      }
    >
      <OnboardingStepProgress currentStep={1} />
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-gb-mo-gray-900">
        Business Information
      </h1>
      <p className="mt-1 text-xs text-gb-mo-gray-500">
        Tell us about your business and store.
      </p>
      <section className="mt-6">
        <BusinessInformationForm values={formValues} onChange={patchForm} />
      </section>
    </MerchantOnboardingScreenLayout>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuth } from "@/features/auth/components/auth-provider";

import { fetchOnboardingReview } from "../services/onboarding-review-service";
import {
  DASHBOARD_PATH,
  ONBOARDING_SECTION_PATHS,
  resolvePostAuthPath,
} from "../utils/onboarding-resume";

const FALLBACK_DESTINATION = ONBOARDING_SECTION_PATHS.business_information;

export function usePostAuthDestination() {
  const { user, isRegistered, isRegistering } = useAuth();

  const reviewQuery = useQuery({
    queryKey: ["merchant-onboarding-review"],
    queryFn: fetchOnboardingReview,
    enabled: Boolean(user) && isRegistered && !isRegistering,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const destination = useMemo(() => {
    if (reviewQuery.data) {
      return resolvePostAuthPath(reviewQuery.data);
    }
    if (reviewQuery.isError) {
      return FALLBACK_DESTINATION;
    }
    return null;
  }, [reviewQuery.data, reviewQuery.isError]);

  const onboardingIncomplete =
    destination != null && destination !== DASHBOARD_PATH;

  return {
    destination,
    onboardingIncomplete,
    review: reviewQuery.data ?? null,
    isResolving:
      Boolean(user) &&
      isRegistered &&
      !isRegistering &&
      reviewQuery.isLoading,
    error: reviewQuery.error,
    refetch: reviewQuery.refetch,
  };
}

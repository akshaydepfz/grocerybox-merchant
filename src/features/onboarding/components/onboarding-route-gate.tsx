"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";

import { SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT } from "../constants";
import { usePostAuthDestination } from "../hooks/use-post-auth-destination";
import {
  findFirstIncompleteSection,
  isOnboardingPaymentPath,
  ONBOARDING_SECTION_PATHS,
} from "../utils/onboarding-resume";

const LOGIN_PATH = "/login";

/**
 * Requires sign-in + merchant registration for onboarding routes.
 * Keeps plan/payment as the last step — not before business/store setup.
 */
export function OnboardingRouteGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthReady, isRegistered, isRegistering } = useAuth();
  const { review, isResolving } = usePostAuthDestination();

  const onPaymentRoute = isOnboardingPaymentPath(pathname);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }
    if (!user) {
      router.replace(LOGIN_PATH);
      return;
    }
    if (!isRegistering && !isRegistered) {
      router.replace(LOGIN_PATH);
      return;
    }
    if (!isRegistered || isRegistering || isResolving || !review) {
      return;
    }
    if (SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT || !onPaymentRoute) {
      return;
    }

    const incomplete = findFirstIncompleteSection(review.sections);
    if (incomplete && incomplete.key !== "subscription_plan") {
      const resumePath = ONBOARDING_SECTION_PATHS[incomplete.key];
      if (resumePath) {
        router.replace(resumePath);
      }
    }
  }, [
    isAuthReady,
    isRegistered,
    isRegistering,
    isResolving,
    onPaymentRoute,
    review,
    router,
    user,
  ]);

  const loadingCopy = !isAuthReady
    ? {
        label: "Signing you in",
        sublabel: "Restoring your merchant session…",
      }
    : isRegistering
      ? {
          label: "Setting up your store",
          sublabel: "Registering merchant account…",
        }
      : isResolving
        ? {
            label: "Preparing onboarding",
            sublabel: "Loading your progress…",
          }
        : {
            label: "Redirecting",
            sublabel: "Taking you to the right step…",
          };

  if (
    !isAuthReady ||
    !user ||
    isRegistering ||
    isResolving ||
    (!isRegistered && !isRegistering)
  ) {
    return (
      <GroceryAnimatedLoader
        fullScreen
        theme="dashboard"
        label={loadingCopy.label}
        sublabel={loadingCopy.sublabel}
      />
    );
  }

  return children;
}
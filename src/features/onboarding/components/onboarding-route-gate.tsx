"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";

import { SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT } from "../constants";
import { usePostAuthDestination } from "../hooks/use-post-auth-destination";
import {
  isOnboardingPaymentPath,
  isSubscriptionOnboardingComplete,
  ONBOARDING_PLAN_PATH,
} from "../utils/onboarding-resume";

const LOGIN_PATH = "/login";

export function OnboardingRouteGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthReady, isRegistered, isRegistering } = useAuth();
  const { review, isResolving } = usePostAuthDestination();

  const paymentRequired = !SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT;
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
    if (!isRegistered || isRegistering || isResolving) {
      return;
    }
    if (!paymentRequired || !review) {
      return;
    }
    if (
      !isSubscriptionOnboardingComplete(review) &&
      !onPaymentRoute
    ) {
      router.replace(ONBOARDING_PLAN_PATH);
    }
  }, [
    isAuthReady,
    isRegistered,
    isRegistering,
    isResolving,
    onPaymentRoute,
    paymentRequired,
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
            sublabel: "Checking subscription and progress…",
          }
        : {
            label: "Redirecting",
            sublabel: "Complete payment to continue setup…",
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

  if (
    paymentRequired &&
    review &&
    !isSubscriptionOnboardingComplete(review) &&
    !onPaymentRoute
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
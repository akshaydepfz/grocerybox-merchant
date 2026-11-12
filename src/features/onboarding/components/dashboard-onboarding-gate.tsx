"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";

import { usePostAuthDestination } from "../hooks/use-post-auth-destination";
import { DASHBOARD_PATH } from "../utils/onboarding-resume";

const LOGIN_PATH = "/login";

export function DashboardOnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthReady, isRegistered, isRegistering } = useAuth();
  const { destination, isResolving } = usePostAuthDestination();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }
    if (!user) {
      router.replace(LOGIN_PATH);
      return;
    }
    if (!isRegistered || isRegistering || isResolving) {
      return;
    }
    if (destination && destination !== DASHBOARD_PATH) {
      router.replace(destination);
    }
  }, [
    destination,
    isAuthReady,
    isRegistered,
    isRegistering,
    isResolving,
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
            label: "Preparing your dashboard",
            sublabel: "Checking onboarding progress…",
          }
        : {
            label: "Redirecting",
            sublabel: "Taking you to the right place…",
          };

  if (!isAuthReady || !user || isRegistering || isResolving) {
    return (
      <GroceryAnimatedLoader
        fullScreen
        theme="dashboard"
        label={loadingCopy.label}
        sublabel={loadingCopy.sublabel}
      />
    );
  }

  if (destination && destination !== DASHBOARD_PATH) {
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

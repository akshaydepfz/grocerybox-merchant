"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

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

  if (!isAuthReady || !user || isRegistering || isResolving) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gb-bg-secondary">
        <Loader2 className="size-8 animate-spin text-gb-onboard-brand" />
      </div>
    );
  }

  if (destination && destination !== DASHBOARD_PATH) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gb-bg-secondary">
        <Loader2 className="size-8 animate-spin text-gb-onboard-brand" />
      </div>
    );
  }

  return children;
}

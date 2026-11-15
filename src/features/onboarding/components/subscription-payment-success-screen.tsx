"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/components/auth-provider";
import { resolveSignedInEmail } from "@/features/auth/services/auth-service";

import { SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT } from "../constants";
import { fetchCurrentSubscription } from "../services/subscription-service";
import { isActiveSubscription } from "../types/subscription";

import {
  MerchantOnboardingScreenLayout,
  OnboardingFormFooter,
  OnboardingStepProgress,
} from "./merchant-onboarding-layout";

const ONBOARDING_REVIEW_PATH = "/onboarding/review";
const PLAN_PROGRESS_STEP = 7;
const PLAN_PROGRESS_TOTAL = 7;

export function SubscriptionPaymentSuccessScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const signedInEmail = resolveSignedInEmail(user?.email);

  const subscriptionQuery = useQuery({
    queryKey: ["merchant-subscription"],
    queryFn: fetchCurrentSubscription,
    enabled: Boolean(user),
    retry: 1,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT) {
      router.replace(ONBOARDING_REVIEW_PATH);
      return;
    }
    void queryClient.invalidateQueries({ queryKey: ["merchant-onboarding-review"] });
  }, [queryClient, router]);

  const planName = subscriptionQuery.data?.planName;
  const subscriptionActive = isActiveSubscription(subscriptionQuery.data);
  const confirming =
    subscriptionQuery.isLoading || subscriptionQuery.isFetching;

  const handleContinueToReview = () => {
    void queryClient.invalidateQueries({ queryKey: ["merchant-onboarding-review"] });
    router.push(ONBOARDING_REVIEW_PATH);
  };

  return (
    <MerchantOnboardingScreenLayout
      signedInEmail={signedInEmail}
      currentStep={6}
      footer={
        <OnboardingFormFooter
          onContinue={handleContinueToReview}
          continueLabel="Continue to Review"
        />
      }
    >
      <OnboardingStepProgress
        currentStep={PLAN_PROGRESS_STEP}
        totalSteps={PLAN_PROGRESS_TOTAL}
      />

      <div
        className={`mt-8 rounded-2xl border p-6 ${
          subscriptionActive
            ? "border-emerald-200 bg-emerald-50"
            : confirming
              ? "border-gb-mo-gray-200 bg-gb-mo-gray-50"
              : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className={`size-7 shrink-0 ${
              subscriptionActive
                ? "text-emerald-600"
                : confirming
                  ? "text-gb-mo-gray-500"
                  : "text-amber-600"
            }`}
          />
          <div>
            <h1 className="text-2xl font-extrabold text-gb-mo-gray-900">
              {confirming && !subscriptionActive
                ? "Confirming payment"
                : subscriptionActive
                  ? "Payment verified"
                  : "Almost there"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gb-mo-gray-600">
              {confirming && !subscriptionActive
                ? "We're checking your subscription with the server. This usually takes a few seconds."
                : subscriptionActive
                  ? `Your subscription is active${planName ? ` (${planName})` : ""}. You can review your store details and publish when everything is ready.`
                  : "Payment was received but your subscription is not active yet. Wait a moment and continue to review, or contact support if this persists."}
            </p>
          </div>
        </div>
      </div>
    </MerchantOnboardingScreenLayout>
  );
}

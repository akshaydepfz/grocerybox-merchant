"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/components/auth-provider";
import { resolveSignedInEmail } from "@/features/auth/services/auth-service";

import { SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT } from "../constants";
import { fetchCurrentSubscription } from "../services/subscription-service";

import {
  MerchantOnboardingScreenLayout,
  OnboardingFormFooter,
  OnboardingStepProgress,
} from "./merchant-onboarding-layout";

const PLAN_PATH = "/onboarding/plan";
const ONBOARDING_REVIEW_PATH = "/onboarding/review";
const PLAN_PROGRESS_STEP = 7;
const PLAN_PROGRESS_TOTAL = 7;

export function SubscriptionPaymentSuccessScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const signedInEmail = resolveSignedInEmail(user?.email);

  const subscriptionQuery = useQuery({
    queryKey: ["merchant-subscription"],
    queryFn: fetchCurrentSubscription,
    enabled: Boolean(user),
    retry: false,
  });

  useEffect(() => {
    if (SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT) {
      router.replace(ONBOARDING_REVIEW_PATH);
    }
  }, [router]);

  const planName = subscriptionQuery.data?.planName;

  return (
    <MerchantOnboardingScreenLayout
      signedInEmail={signedInEmail}
      currentStep={6}
      footer={
        <OnboardingFormFooter
          onBack={() => router.push(PLAN_PATH)}
          onContinue={() => router.push(ONBOARDING_REVIEW_PATH)}
          continueLabel="Continue to Review"
        />
      }
    >
      <OnboardingStepProgress
        currentStep={PLAN_PROGRESS_STEP}
        totalSteps={PLAN_PROGRESS_TOTAL}
      />

      <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="size-7 shrink-0 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-extrabold text-gb-mo-gray-900">
              Payment verified
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gb-mo-gray-600">
              Your subscription is active
              {planName ? ` (${planName})` : ""}. You can review your store
              details and publish when everything is ready.
            </p>
          </div>
        </div>
      </div>
    </MerchantOnboardingScreenLayout>
  );
}

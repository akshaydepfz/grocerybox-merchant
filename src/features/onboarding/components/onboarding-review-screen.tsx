"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/components/auth-provider";
import { AuthError, resolveSignedInEmail } from "@/features/auth/services/auth-service";
import { ApiError } from "@/lib/api/types";

import {
  fetchOnboardingReview,
  publishStore,
} from "../services/onboarding-review-service";
import {
  fetchCurrentSubscription,
  fetchSubscriptionPlans,
  verifySubscriptionPayment,
} from "../services/subscription-service";
import { SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT } from "../constants";
import { isActiveSubscription } from "../types/subscription";
import { canPublishStore } from "../utils/onboarding-publish-eligibility";
import { publishErrorMessage } from "../utils/publish-error-message";
import { runSubscriptionCheckout } from "../utils/run-subscription-checkout";

import {
  MerchantOnboardingScreenLayout,
  OnboardingFormFooter,
  OnboardingStepProgress,
} from "./merchant-onboarding-layout";
import {
  ReviewMessageCard,
  ReviewSectionRow,
  SubscriptionStatusCard,
} from "./onboarding-review-parts";

const PLAN_PATH = "/onboarding/plan";
const PLAN_SUCCESS_PATH = "/onboarding/plan/success";
const STORE_CONFIG_PATH = "/onboarding/store-config";
const DASHBOARD_PATH = "/dashboard";
const REVIEW_BACK_PATH = SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT
  ? STORE_CONFIG_PATH
  : PLAN_SUCCESS_PATH;

export function OnboardingReviewScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const signedInEmail = resolveSignedInEmail(user?.email);

  const [isCheckoutBusy, setIsCheckoutBusy] = useState(false);
  const verifyingSignatureRef = useRef<string | null>(null);

  const reviewQuery = useQuery({
    queryKey: ["merchant-onboarding-review"],
    queryFn: fetchOnboardingReview,
    enabled: Boolean(user),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const subscriptionQuery = useQuery({
    queryKey: ["merchant-subscription"],
    queryFn: fetchCurrentSubscription,
    enabled: Boolean(user),
    retry: false,
  });

  const plansQuery = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: fetchSubscriptionPlans,
    enabled: Boolean(user),
    retry: false,
  });

  const publishMutation = useMutation({
    mutationFn: publishStore,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["merchant-onboarding-review"],
      });
      toast.success(
        result.alreadyPublished
          ? "Your store is already published."
          : "Your store has been published successfully.",
      );
      if (result.alreadyPublished) {
        router.push(DASHBOARD_PATH);
      } else {
        router.replace(DASHBOARD_PATH);
      }
    },
    onError: (error) => {
      if (error instanceof ApiError && (error.status === 400 || error.status === 422)) {
        toast.error(publishErrorMessage(error));
        void reviewQuery.refetch();
        return;
      }
      toast.error(
        error instanceof AuthError
          ? error.message
          : publishErrorMessage(error),
      );
    },
  });

  const verifyCheckout = useCallback(
    async (payload: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => {
      const signatureKey = `${payload.razorpayOrderId}:${payload.razorpayPaymentId}`;
      if (verifyingSignatureRef.current === signatureKey) {
        return;
      }
      verifyingSignatureRef.current = signatureKey;
      setIsCheckoutBusy(true);

      try {
        const subscription = await verifySubscriptionPayment(payload);
        queryClient.setQueryData(["merchant-subscription"], subscription);
        await queryClient.invalidateQueries({
          queryKey: ["merchant-onboarding-review"],
        });
        if (isActiveSubscription(subscription)) {
          toast.success("Subscription activated successfully.");
        }
      } catch (error) {
        toast.error(
          error instanceof ApiError || error instanceof AuthError
            ? error.message
            : "Payment verification failed.",
        );
      } finally {
        setIsCheckoutBusy(false);
      }
    },
    [queryClient],
  );

  const resumeCheckout = useCallback(async () => {
    const plans = plansQuery.data ?? [];
    const subscription = subscriptionQuery.data;
    const plan =
      plans.find((item) => item.planId === subscription?.planId) ?? plans[0];

    if (!plan) {
      toast.error("Select a plan before continuing to payment.");
      router.push(PLAN_PATH);
      return;
    }

    setIsCheckoutBusy(true);
    await runSubscriptionCheckout({
      plan,
      customerEmail: signedInEmail || undefined,
      onVerifying: () => setIsCheckoutBusy(true),
      onDismiss: () => {
        setIsCheckoutBusy(false);
        toast.message(
          "Payment was not completed. You can retry checkout when ready.",
        );
      },
      onFailure: (message) => {
        setIsCheckoutBusy(false);
        toast.error(message);
      },
      onSuccess: (payload) => {
        setIsCheckoutBusy(false);
        void verifyCheckout(payload);
      },
    });
    setIsCheckoutBusy(false);
  }, [plansQuery.data, router, signedInEmail, subscriptionQuery.data, verifyCheckout]);

  const review = reviewQuery.data;
  const isLoading = reviewQuery.isLoading && !review;
  const canPublish =
    canPublishStore(review) && !publishMutation.isPending;

  return (
    <MerchantOnboardingScreenLayout
      signedInEmail={signedInEmail}
      currentStep={6}
      footer={
        <OnboardingFormFooter
          onBack={() => router.push(REVIEW_BACK_PATH)}
          onContinue={
            canPublish ? () => publishMutation.mutate() : undefined
          }
          continueLabel={
            publishMutation.isPending ? "Publishing…" : "Publish Store"
          }
          isContinueLoading={publishMutation.isPending || isCheckoutBusy}
        />
      }
    >
      <OnboardingStepProgress currentStep={6} />
      <h1 className="mt-5 text-[28px] font-extrabold tracking-tight text-gb-mo-gray-900">
        Review &amp; Publish
      </h1>
      <p className="mt-1 text-sm font-medium text-gb-mo-gray-500">
        Confirm your onboarding details and publish your store when ready.
      </p>

      <section className="mt-5 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-8 animate-spin text-gb-onboard-brand" />
          </div>
        ) : !review ? (
          <ReviewMessageCard
            message={
              reviewQuery.error instanceof ApiError
                ? reviewQuery.error.message
                : "Unable to load onboarding review."
            }
            tone="error"
            actionLabel="Retry"
            onAction={() => void reviewQuery.refetch()}
          />
        ) : (
          <>
            {!SKIP_ONBOARDING_SUBSCRIPTION_PAYMENT ? (
              <SubscriptionStatusCard
                status={review.subscriptionPublishStatus}
                onSelectPlan={() => router.push(PLAN_PATH)}
                onResumeCheckout={() => void resumeCheckout()}
              />
            ) : null}

            {review.storePublished ? (
              <ReviewMessageCard
                message="Your store is live and published."
                tone="success"
                actionLabel="Open dashboard"
                onAction={() => router.push(DASHBOARD_PATH)}
              />
            ) : null}

            <div>
              <h2 className="text-base font-bold text-gb-mo-gray-900">
                Onboarding checklist
              </h2>
              <div className="mt-3">
                {review.sections.map((section) => (
                  <ReviewSectionRow key={section.key} section={section} />
                ))}
              </div>
              {canPublishStore(review) ? (
                <p className="mt-4 text-xs font-semibold text-emerald-700">
                  All required sections are complete. You can publish your store.
                </p>
              ) : (
                <p className="mt-4 text-xs text-gb-mo-gray-600">
                  Complete the remaining sections before publishing.
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </MerchantOnboardingScreenLayout>
  );
}

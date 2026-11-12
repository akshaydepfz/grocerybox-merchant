"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/features/auth/components/auth-provider";
import { AuthError, resolveSignedInEmail } from "@/features/auth/services/auth-service";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ApiError } from "@/lib/api/types";

import { openRazorpayCheckout } from "../services/razorpay-checkout";
import {
  createSubscriptionPaymentOrder,
  fetchCurrentSubscription,
  fetchSubscriptionPlans,
  selectSubscriptionPlan,
  verifySubscriptionPayment,
} from "../services/subscription-service";
import {
  isActiveSubscription,
  type SubscriptionPlan,
} from "../types/subscription";

import {
  MerchantOnboardingScreenLayout,
  OnboardingFormFooter,
  OnboardingStepProgress,
} from "./merchant-onboarding-layout";
import {
  PlanLoadingState,
  PlanPricingGrid,
  PlanStatusBanner,
  RazorpayInfoBanner,
} from "./plan-parts";

const STORE_CONFIG_PATH = "/onboarding/store-config";
const PLAN_SUCCESS_PATH = "/onboarding/plan/success";
const ONBOARDING_REVIEW_PATH = "/onboarding/review";
const PLAN_PROGRESS_STEP = 7;
const PLAN_PROGRESS_TOTAL = 7;

function defaultSelectedPlan(plans: SubscriptionPlan[]): SubscriptionPlan | null {
  if (plans.length === 0) return null;
  return plans.length > 1 ? plans[1] : plans[0];
}

export function PlanScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const signedInEmail = resolveSignedInEmail(user?.email);
  const wideGrid = useMediaQuery("(min-width: 720px)");

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isPaymentBusy, setIsPaymentBusy] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const verifyingSignatureRef = useRef<string | null>(null);
  const checkoutOpenRef = useRef(false);

  const plansQuery = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: fetchSubscriptionPlans,
    enabled: Boolean(user),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const subscriptionQuery = useQuery({
    queryKey: ["merchant-subscription"],
    queryFn: fetchCurrentSubscription,
    enabled: Boolean(user),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const plans = plansQuery.data ?? [];
  const selectedPlan =
    plans.find((plan) => plan.planId === selectedPlanId) ??
    defaultSelectedPlan(plans);
  const currentSubscription = subscriptionQuery.data ?? null;

  useEffect(() => {
    if (isActiveSubscription(subscriptionQuery.data)) {
      router.replace(PLAN_SUCCESS_PATH);
    }
  }, [router, subscriptionQuery.data]);

  const refreshSubscription = useCallback(async () => {
    const data = await fetchCurrentSubscription();
    queryClient.setQueryData(["merchant-subscription"], data);
    void queryClient.invalidateQueries({ queryKey: ["merchant-onboarding-review"] });
    if (isActiveSubscription(data)) {
      router.replace(PLAN_SUCCESS_PATH);
    }
    return data;
  }, [queryClient, router]);

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
      setIsPaymentBusy(true);

      try {
        const subscription = await verifySubscriptionPayment(payload);
        queryClient.setQueryData(["merchant-subscription"], subscription);
        if (isActiveSubscription(subscription)) {
          setPendingMessage(null);
          router.replace(PLAN_SUCCESS_PATH);
          return;
        }
        setPendingMessage(
          "Payment received but subscription is not active yet. Refresh status or contact support.",
        );
      } catch (error) {
        const message =
          error instanceof ApiError || error instanceof AuthError
            ? error.message
            : "Payment may have succeeded but verification failed.";
        const lower = message.toLowerCase();
        if (
          lower.includes("not captured") ||
          lower.includes("already verified")
        ) {
          const refreshed = await refreshSubscription();
          if (isActiveSubscription(refreshed)) {
            return;
          }
          setPendingMessage(message);
        } else {
          setPendingMessage(
            "Payment may have succeeded but verification failed. Refresh subscription status before paying again.",
          );
        }
        toast.error(message);
      } finally {
        setIsPaymentBusy(false);
      }
    },
    [queryClient, refreshSubscription, router],
  );

  const openCheckoutForPlan = useCallback(
    async (plan: SubscriptionPlan) => {
      if (checkoutOpenRef.current || isPaymentBusy) {
        return;
      }

      setIsPaymentBusy(true);
      setPendingMessage(null);

      try {
        await selectSubscriptionPlan(plan.planId);
      } catch (error) {
        toast.error(
          error instanceof ApiError || error instanceof AuthError
            ? error.message
            : "Unable to select subscription plan.",
        );
        setIsPaymentBusy(false);
        return;
      }

      let order;
      try {
        order = await createSubscriptionPaymentOrder();
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Unable to start payment.";
        if (
          error instanceof ApiError &&
          error.status === 400 &&
          message.toLowerCase().includes("not captured")
        ) {
          setPendingMessage(message);
        } else {
          toast.error(message);
        }
        setIsPaymentBusy(false);
        return;
      }

      checkoutOpenRef.current = true;
      setIsPaymentBusy(false);

      await openRazorpayCheckout({
        keyId: order.keyId,
        amountPaise: order.amount,
        currency: order.currency,
        orderId: order.orderId,
        merchantName: "Grocery.in",
        description: `${plan.name} subscription`,
        customerEmail: signedInEmail || undefined,
        onSuccess: (success) => {
          checkoutOpenRef.current = false;
          void verifyCheckout(success);
        },
        onFailure: (failure) => {
          checkoutOpenRef.current = false;
          toast.error(
            failure.description || "Payment failed. Please try again.",
          );
        },
        onDismiss: () => {
          checkoutOpenRef.current = false;
          setPendingMessage(
            "Payment was not completed. You can retry checkout when ready.",
          );
        },
      });
    },
    [isPaymentBusy, signedInEmail, verifyCheckout],
  );

  const handleContinueToPayment = useCallback(async () => {
    if (!selectedPlan?.planId) {
      toast.error("Select a subscription plan to continue.");
      return;
    }
  void openCheckoutForPlan(selectedPlan);
  }, [openCheckoutForPlan, selectedPlan]);

  const isLoadingPlans = plansQuery.isLoading && plans.length === 0;
  const hasActiveSubscription = isActiveSubscription(currentSubscription);

  return (
    <MerchantOnboardingScreenLayout
      signedInEmail={signedInEmail}
      currentStep={6}
      footer={
        <OnboardingFormFooter
          onBack={() => router.push(STORE_CONFIG_PATH)}
          onContinue={
            isLoadingPlans ? undefined : () => void handleContinueToPayment()
          }
          continueLabel={isPaymentBusy ? "Processing…" : "Continue to Payment"}
          isContinueLoading={isPaymentBusy}
        />
      }
    >
      <OnboardingStepProgress
        currentStep={PLAN_PROGRESS_STEP}
        totalSteps={PLAN_PROGRESS_TOTAL}
      />
      <h1 className="mt-5 text-[28px] font-extrabold tracking-tight text-gb-mo-gray-900">
        Choose a Plan to Publish
      </h1>
      <p className="mt-1 text-sm font-medium text-gb-mo-gray-500">
        Select a plan that fits your business. You can upgrade anytime.
      </p>

      {hasActiveSubscription ? (
        <div className="mt-4">
          <PlanStatusBanner
            tone="success"
            message={`${
              currentSubscription?.planName ?? selectedPlan?.name ?? "Your"
            } subscription is active.`}
          />
        </div>
      ) : null}

      {pendingMessage ? (
        <div className="mt-4">
          <PlanStatusBanner
            tone="warning"
            message={pendingMessage}
            actionLabel="Refresh status"
            onAction={() => void refreshSubscription()}
          />
        </div>
      ) : null}

      <section className="mt-7">
        {isLoadingPlans ? (
          <PlanLoadingState>
            <Loader2 className="size-8 animate-spin text-gb-onboard-brand" />
          </PlanLoadingState>
        ) : plans.length === 0 ? (
          <PlanStatusBanner
            tone="error"
            message={
              plansQuery.error instanceof ApiError
                ? plansQuery.error.message
                : "Unable to load subscription plans."
            }
            actionLabel="Retry"
            onAction={() => void plansQuery.refetch()}
          />
        ) : (
          <PlanPricingGrid
            twoCol={wideGrid}
            plans={plans}
            selectedPlanId={selectedPlan?.planId ?? null}
            onSelectPlan={(plan) => setSelectedPlanId(plan.planId)}
          />
        )}
      </section>

      <div className="mt-6">
        <RazorpayInfoBanner />
      </div>

      {hasActiveSubscription ? (
        <div className="mt-4">
          <Link
            href={ONBOARDING_REVIEW_PATH}
            className="text-sm font-semibold text-gb-mo-brand-dark underline"
          >
            Skip to review &amp; publish
          </Link>
        </div>
      ) : null}
    </MerchantOnboardingScreenLayout>
  );
}

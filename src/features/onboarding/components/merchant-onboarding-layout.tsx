"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  Loader2,
  Store,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { GoogleGlyph } from "@/features/auth/components/google-glyph";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import {
  ONBOARDING_STEPS,
  ONBOARDING_STORE_ILLUSTRATION_URL,
  ONBOARDING_TOTAL_STEPS,
} from "../constants";

type StepState = "completed" | "active" | "pending";

function stepState(stepNumber: number, currentStep: number): StepState {
  if (stepNumber < currentStep) return "completed";
  if (stepNumber === currentStep) return "active";
  return "pending";
}

type MerchantOnboardingScreenLayoutProps = {
  signedInEmail: string;
  currentStep: number;
  children: ReactNode;
  footer: ReactNode;
};

export function MerchantOnboardingScreenLayout({
  signedInEmail,
  currentStep,
  children,
  footer,
}: MerchantOnboardingScreenLayoutProps) {
  const isWide = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MerchantOnboardingHeader email={signedInEmail} />
      <LayoutPadding className="flex flex-1 px-5 pb-4 pt-2 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col">
          <OnboardingCard
            className={cn(
              "flex-1 overflow-hidden border border-gb-mo-gray-200 bg-white",
              isWide ? "min-h-[640px] rounded-2xl" : "rounded-xl",
            )}
          >
            {isWide ? (
              <>
                <OnboardingSidebarPanel className="w-80 shrink-0 overflow-y-auto border-r border-gb-mo-gray-100 bg-gb-mo-sidebar p-8">
                  <OnboardingSidebar currentStep={currentStep} />
                </OnboardingSidebarPanel>
                <MerchantOnboardingFormShell footer={footer}>
                  {children}
                </MerchantOnboardingFormShell>
              </>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="max-h-[320px] shrink-0 overflow-y-auto border-b border-gb-mo-gray-100">
                  <OnboardingSidebar currentStep={currentStep} compact />
                </div>
                <MerchantOnboardingFormShell footer={footer}>
                  {children}
                </MerchantOnboardingFormShell>
              </div>
            )}
          </OnboardingCard>
        </div>
      </LayoutPadding>
    </div>
  );
}

function LayoutPadding({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function OnboardingCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex", className)}>{children}</div>;
}

function OnboardingSidebarPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <aside className={className}>{children}</aside>;
}

export function MerchantOnboardingFormShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 lg:px-8">
        {children}
      </div>
      <FormFooter className="border-t border-gb-mo-gray-100 px-6 pb-6 pt-5 lg:px-8">
        {footer}
      </FormFooter>
    </div>
  );
}

function FormFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function MerchantOnboardingHeader({ email }: { email: string }) {
  const stackTitle = useMediaQuery("(max-width: 719px)");

  return (
    <header className="px-6 py-4">
      <div className="mx-auto max-w-[1280px]">
        {stackTitle ? (
          <div className="flex flex-col gap-3">
            <HeaderBrandRow />
            <SignedInPill email={email} />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <HeaderBrandRow />
            <SignedInPill email={email} />
          </div>
        )}
      </div>
    </header>
  );
}

function HeaderBrandRow() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-lg bg-gb-onboard-brand shadow-sm">
        <Store className="size-5 text-white" />
      </div>
      <span className="text-2xl font-bold tracking-tight text-gb-mo-gray-900">
        Grocery<span className="text-gb-onboard-lime-500">.in</span>
      </span>
      <div className="mx-2 hidden h-6 w-px bg-gb-mo-gray-300 sm:block" />
      <span className="text-lg font-semibold text-gb-mo-gray-800">
        Merchant Onboarding
      </span>
    </div>
  );
}

function SignedInPill({ email }: { email: string }) {
  const displayEmail = email || "Not signed in";
  return (
    <SignedInPillWrap className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-gb-mo-gray-200/80 bg-white px-4 py-2">
      <GoogleGlyph size={16} />
      <span className="text-xs text-gb-mo-gray-500">Signed in as</span>
      <span className="truncate text-xs font-semibold text-gb-mo-gray-800">
        {displayEmail}
      </span>
      <ChevronDown className="size-4 shrink-0 text-gb-mo-gray-600" />
    </SignedInPillWrap>
  );
}

function SignedInPillWrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function OnboardingSidebar({
  currentStep,
  compact,
}: {
  currentStep: number;
  compact?: boolean;
}) {
  return (
    <div className={cn(compact ? "p-6" : "")}>
      <IllustrationWrap className="flex justify-center">
        <Image
          src={ONBOARDING_STORE_ILLUSTRATION_URL}
          alt=""
          width={192}
          height={192}
          className="object-contain"
          unoptimized
        />
      </IllustrationWrap>
      <h2 className="mt-4 text-2xl font-bold leading-tight text-gb-mo-gray-900">
        Set up your
        <br />
        online store
      </h2>
      <p className="mt-2 text-xs leading-relaxed text-gb-mo-gray-500">
        Add your business details to create your store.
      </p>
      <ol className="mt-6 space-y-2">
        {ONBOARDING_STEPS.map((label, index) => {
          const number = index + 1;
          const state = stepState(number, currentStep);
          return (
            <OnboardingStepRow
              key={label}
              number={number}
              label={label}
              state={state}
            />
          );
        })}
      </ol>
      <div className="mt-4 h-1 w-12 rounded-full bg-gb-mo-accent-lime" />
    </div>
  );
}

function IllustrationWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function OnboardingStepRow({
  number,
  label,
  state,
}: {
  number: number;
  label: string;
  state: StepState;
}) {
  const isActive = state === "active";
  const isCompleted = state === "completed";

  return (
    <li
      className={cn(
        "flex items-center gap-3",
        isActive &&
          "rounded-full bg-gb-mo-step-active-bg px-3 py-2",
        !isActive && "px-2 py-1.5",
      )}
    >
      <StepIndicator number={number} state={state} />
      <span
        className={cn(
          "text-gb-mo-gray-900",
          isActive && "text-[13px] font-bold",
          isCompleted && "text-xs font-semibold",
          state === "pending" && "text-xs font-medium text-gb-mo-gray-500",
        )}
      >
        {label}
      </span>
    </li>
  );
}

function StepIndicator({ number, state }: { number: number; state: StepState }) {
  if (state === "completed") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-gb-onboard-brand-dark">
        <Check className="size-3.5 text-white" strokeWidth={3} />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-gb-mo-step-active-badge text-xs font-bold text-white">
        {number}
      </span>
    );
  }
  return (
    <span className="flex size-6 items-center justify-center rounded-full border border-gb-mo-gray-300 text-xs font-semibold text-gb-mo-gray-500">
      {number}
    </span>
  );
}

export function OnboardingStepProgress({
  currentStep,
  useGradient = false,
}: {
  currentStep: number;
  useGradient?: boolean;
}) {
  const progress = currentStep / ONBOARDING_TOTAL_STEPS;
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold text-gb-mo-gray-700">
        Step {currentStep} of {ONBOARDING_TOTAL_STEPS}
      </p>
      <ProgressTrack
        className={cn(
          "mt-2 overflow-hidden rounded-full bg-gb-mo-progress-track",
          useGradient ? "h-2" : "h-1.5",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            useGradient
              ? "bg-gradient-to-r from-gb-onboard-brand to-gb-onboard-lime-500"
              : "bg-gb-mo-progress-fill",
          )}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </ProgressTrack>
    </div>
  );
}

function ProgressTrack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function OnboardingFormFooter({
  onBack,
  onContinue,
  isContinueLoading,
  continueLabel = "Continue",
  continueColor,
}: {
  onBack?: () => void;
  onContinue?: () => void;
  isContinueLoading?: boolean;
  continueLabel?: string;
  /** Tailwind background class for continue button (Flutter `continueColor`). */
  continueColor?: string;
}) {
  const stackActions = useMediaQuery("(max-width: 479px)");

  return (
    <div
      className={cn(
        "flex gap-3",
        stackActions ? "flex-col" : "flex-row items-center",
        onBack && !stackActions ? "justify-between" : "justify-end",
      )}
    >
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isContinueLoading}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-full border border-gb-mo-gray-300 px-6 py-3 text-sm font-bold text-gb-mo-gray-700",
            "transition hover:bg-gb-mo-gray-100 disabled:opacity-50",
            stackActions ? "w-full" : "",
          )}
        >
          <ArrowRight className="size-[18px] rotate-180" />
          Back
        </button>
      ) : null}
      <button
        type="button"
        disabled={isContinueLoading || !onContinue}
        onClick={onContinue}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold",
          continueColor ?? "bg-gb-mo-continue",
          "text-gb-mo-gray-900 transition hover:brightness-95",
          "disabled:cursor-not-allowed disabled:bg-gb-mo-gray-200 disabled:text-gb-mo-gray-500",
          stackActions ? "w-full" : "min-w-[160px]",
        )}
      >
        {isContinueLoading ? (
          <>
            <Loader2 className="size-[18px] animate-spin" />
            Saving...
          </>
        ) : (
          <>
            {continueLabel}
            <ArrowRight className="size-[18px]" />
          </>
        )}
      </button>
    </div>
  );
}

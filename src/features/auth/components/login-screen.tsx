"use client";

import type { FirebaseError } from "firebase/app";
import {
  BarChart3,
  Bolt,
  Loader2,
  Mail,
  ShieldCheck,
  Verified,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { signInWithGoogle, signOut } from "../services/auth-service";
import { firebaseAuthMessage } from "../utils/firebase-auth-messages";

import { usePostAuthDestination } from "@/features/onboarding/hooks/use-post-auth-destination";

import { AppLogoImage, GroceryBrandLogo } from "@/components/branding/app-logo";

import { useAuth } from "./auth-provider";
import { GoogleGlyph } from "./google-glyph";

const SIGN_IN_BRAND_LOGO = { variant: "grocerybox-in" as const };

function GroceryboxDomainInHeadline() {
  return (
    <>
      <span className="text-gb-onboard-brand">Grocerybox</span>
      <span className="text-gb-onboard-lime-500">.in</span>
    </>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const isWide = useMediaQuery("(min-width: 900px)");
  const {
    user,
    isAuthReady,
    isRegistering,
    isRegistered,
    registrationError,
    retryRegistration,
  } = useAuth();
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const { destination, isResolving } = usePostAuthDestination();

  useEffect(() => {
    if (!isAuthReady || !user || !isRegistered || isRegistering || isResolving) {
      return;
    }
    if (destination) {
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

  const handleGoogleSignIn = useCallback(async () => {
    if (isGoogleSigningIn) {
      return;
    }
    setIsGoogleSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError?.code) {
        toast.error(firebaseAuthMessage(firebaseError));
      } else {
        toast.error("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  }, [isGoogleSigningIn]);

  const handleEmailContinue = useCallback(() => {
    toast.message("Sign in with Google to register your merchant account.");
  }, []);

  if (!isAuthReady) {
    return <FullScreenSpinner />;
  }

  if (user && registrationError && !isRegistering && !isRegistered) {
    return (
      <RegistrationErrorState
        message={registrationError}
        onRetry={() => void retryRegistration()}
        onSignOut={() => void signOut()}
      />
    );
  }

  if (user && (isRegistering || (isRegistered && isResolving))) {
    return <FullScreenSpinner />;
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-white lg:min-h-screen">
      <DecorativeBackground compact={!isWide} />
      <div className="relative z-10 flex min-h-dvh flex-col lg:min-h-screen">
        <div
          className={cn(
            "mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-6 py-5 lg:justify-center lg:px-12 lg:py-8",
            !isWide && "justify-start px-4 pb-6 pt-[max(1rem,env(safe-area-inset-top))]",
          )}
        >
          {isWide ? (
            <div className="grid min-h-[min(720px,calc(100vh-4rem))] grid-cols-12 items-center gap-10">
              <div className="col-span-7">
                <BrandIntroduction isWide />
              </div>
              <div className="col-span-5 flex justify-center">
                <SignInCard
                  onGoogleSignIn={() => void handleGoogleSignIn()}
                  onEmailSignIn={handleEmailContinue}
                  isGoogleSigningIn={isGoogleSigningIn}
                />
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4">
              <MobileSignInHero />
              <SignInCard
                layout="mobile"
                onGoogleSignIn={() => void handleGoogleSignIn()}
                onEmailSignIn={handleEmailContinue}
                isGoogleSigningIn={isGoogleSigningIn}
              />
              <MobileSignInHighlights />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Loader2 className="size-8 animate-spin text-gb-onboard-brand" />
    </div>
  );
}

function RegistrationErrorState({
  message,
  onRetry,
  onSignOut,
}: {
  message: string;
  onRetry: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <p className="max-w-md text-sm text-gb-onboard-slate-600">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-gb-onboard-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-gb-onboard-emerald-700"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function DecorativeBackground({ compact }: { compact?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1240 860"
        preserveAspectRatio="none"
      >
        <path
          fill="rgb(246 252 246 / 0.9)"
          d="M720 0C580 180 500 240 450 440C390 680 430 860 430 860L1240 860L1240 0Z"
        />
      </svg>
      <div
        className={cn(
          "absolute -right-16 -top-16 rotate-12 rounded-full bg-gradient-to-br from-gb-onboard-accent to-gb-onboard-lime opacity-90 blur-sm",
          compact ? "size-48 opacity-70" : "size-80",
        )}
      />
      <div
        className={cn(
          "absolute rounded-full bg-gb-onboard-bright-lime/80 blur-sm",
          compact
            ? "bottom-[-4rem] right-6 h-40 w-56 opacity-60"
            : "bottom-[-6rem] right-48 h-56 w-96",
        )}
      />
      <div
        className={cn(
          "absolute -bottom-10 -right-10 rounded-full bg-gb-onboard-lime/90",
          compact ? "size-40 opacity-80" : "size-64",
        )}
      />
    </div>
  );
}

function MobileSignInHero() {
  return (
    <header className="flex flex-col items-center text-center">
      <GroceryBrandLogo {...SIGN_IN_BRAND_LOGO} />
      <div className="mt-3 inline-flex rounded-full bg-gb-onboard-pill-badge px-3 py-1">
        <span className="text-[11px] font-semibold tracking-wide text-gb-onboard-emerald-950">
          For Store Owners
        </span>
      </div>
      <h1 className="mt-2 max-w-[20rem] text-[1.375rem] font-extrabold leading-snug tracking-tight text-gb-onboard-slate-900">
        Create your online grocery store with <GroceryboxDomainInHeadline />
      </h1>
    </header>
  );
}

function MobileSignInHighlights() {
  const items = [
    { icon: Bolt, label: "Quick setup" },
    { icon: BarChart3, label: "Grow sales" },
    { icon: ShieldCheck, label: "Secure" },
  ] as const;

  return (
    <ul className="grid grid-cols-3 gap-2 px-1">
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex flex-col items-center gap-1 rounded-2xl border border-gb-onboard-slate-200/80 bg-white/80 px-2 py-2.5 text-center shadow-sm"
        >
          <Icon className="size-4 text-gb-onboard-emerald-600" aria-hidden />
          <span className="text-[10px] font-semibold leading-tight text-gb-onboard-slate-700">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function BrandIntroduction({ isWide }: { isWide: boolean }) {
  return (
    <div className="flex flex-col items-start text-left">
      <GroceryBrandLogo {...SIGN_IN_BRAND_LOGO} />
      <div className="mt-8 inline-flex rounded-full bg-gb-onboard-pill-badge px-3.5 py-1.5">
        <span className="text-xs font-semibold tracking-wide text-gb-onboard-emerald-950">
          For Store Owners
        </span>
      </div>
      <h1
        className={cn(
          "mt-4 font-extrabold tracking-tight text-gb-onboard-slate-900",
          isWide ? "text-5xl leading-[1.15]" : "text-4xl leading-[1.15]",
        )}
      >
        Create your online grocery store with <GroceryboxDomainInHeadline />
      </h1>
      <p
        className={cn(
          "mt-3 max-w-xl leading-relaxed text-gb-onboard-slate-600",
          isWide ? "text-lg" : "text-base",
        )}
      >
        Get your own branded store, manage products, orders and deliveries — all in
        one place.
      </p>
      <div
        className={cn(
          "mt-8 w-full",
          isWide ? "flex flex-row items-start gap-8" : "flex flex-col gap-5",
        )}
      >
        <StoreIllustration size={isWide ? 224 : 192} centered={!isWide} />
        <div className="flex flex-1 flex-col gap-4">
          <FeatureItem
            icon={<Bolt className="size-[22px] text-gb-onboard-lime-500" />}
            iconBg="bg-gb-onboard-feature-lime"
            iconBorder="border-[#99D9F99D]"
            title="Set up in minutes"
            subtitle="Create your store in a few simple steps"
          />
          <FeatureItem
            icon={<BarChart3 className="size-[22px] text-gb-onboard-emerald-600" />}
            iconBg="bg-gb-onboard-feature-emerald"
            iconBorder="border-[#99A7F3D0]"
            title="Grow your business"
            subtitle="Reach more customers in your area"
          />
          <FeatureItem
            icon={<ShieldCheck className="size-[22px] text-gb-onboard-lime-500" />}
            iconBg="bg-gb-onboard-feature-lime"
            iconBorder="border-[#99D9F99D]"
            title="Secure & reliable"
            subtitle="Built with enterprise-grade security"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  iconBg,
  iconBorder,
  title,
  subtitle,
}: {
  icon: ReactNode;
  iconBg: string;
  iconBorder: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex gap-3.5">
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
          iconBg,
          iconBorder,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-tight text-gb-onboard-slate-900">
          {title}
        </p>
        <p className="text-xs text-gb-onboard-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function StoreIllustration({
  size,
  centered,
}: {
  size: number;
  centered?: boolean;
}) {
  return (
    <div
      className={cn("relative shrink-0", centered && "mx-auto")}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-[5%] rounded-full bg-gb-onboard-emerald-200/40 blur-3xl"
        aria-hidden
      />
      <AppLogoImage
        size={size}
        alt=""
        className="relative"
        priority={size >= 192}
      />
    </div>
  );
}

function SignInCard({
  layout = "desktop",
  onGoogleSignIn,
  onEmailSignIn,
  isGoogleSigningIn,
}: {
  layout?: "desktop" | "mobile";
  onGoogleSignIn: () => void;
  onEmailSignIn: () => void;
  isGoogleSigningIn: boolean;
}) {
  const isMobileLayout = layout === "mobile";

  return (
    <div
      className={cn(
        "w-full border border-white/80 bg-white/95 shadow-[0_20px_45px_-12px_rgb(22_163_74_/_0.12)]",
        isMobileLayout
          ? "max-w-none rounded-3xl p-5"
          : "max-w-[420px] rounded-[32px] p-8 sm:px-10 sm:py-10",
      )}
    >
      <div className="flex flex-col items-center">
        {!isMobileLayout ? (
          <GroceryBrandLogo size="compact" {...SIGN_IN_BRAND_LOGO} />
        ) : null}
        <h2
          className={cn(
            "text-center font-bold tracking-tight text-gb-onboard-slate-900",
            isMobileLayout ? "text-xl" : "mt-6 text-2xl",
          )}
        >
          Sign in to get started
        </h2>
        <p
          className={cn(
            "text-center text-sm leading-snug text-gb-onboard-slate-600",
            isMobileLayout ? "mt-1.5" : "mt-2 leading-relaxed",
          )}
        >
          Use your Google account to create and manage your merchant account on{" "}
          <span className="font-semibold text-gb-onboard-emerald-700">
            Grocerybox.in
          </span>
        </p>
        <div className={cn("w-full", isMobileLayout ? "mt-5" : "mt-7")}>
          <GoogleSignInButton
            onClick={onGoogleSignIn}
            isLoading={isGoogleSigningIn}
            compact={isMobileLayout}
          />
        </div>
        <OrDivider compact={isMobileLayout} />
        <EmailSignInButton onClick={onEmailSignIn} compact={isMobileLayout} />
        <div
          className={cn(
            "flex w-full gap-2 text-left",
            isMobileLayout ? "mt-5" : "mt-8",
          )}
        >
          <Verified className="mt-0.5 size-4 shrink-0 text-gb-onboard-emerald-600" />
          <p className="text-xs leading-relaxed text-gb-onboard-slate-600">
            By continuing, you agree to our{" "}
            <span className="font-semibold text-gb-onboard-emerald-700 underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="font-semibold text-gb-onboard-emerald-700 underline">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleSignInButton({
  onClick,
  isLoading,
  compact,
}: {
  onClick: () => void;
  isLoading: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-full",
        compact ? "h-12" : "h-[52px]",
        "bg-gb-onboard-bright-lime text-sm font-bold text-gb-onboard-slate-900",
        "shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70",
      )}
    >
      {isLoading ? (
        <Loader2 className="size-[22px] animate-spin" />
      ) : (
        <>
          <span className="flex size-7 items-center justify-center rounded-full bg-white shadow-sm">
            <GoogleGlyph size={16} />
          </span>
          Continue with Google
        </>
      )}
    </button>
  );
}

function EmailSignInButton({
  onClick,
  compact,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2.5 rounded-full border",
        compact ? "mt-3 h-11" : "mt-4 h-12",
        "border-gb-onboard-slate-700/80 bg-white text-sm font-semibold text-gb-onboard-slate-800",
        "transition hover:bg-gb-onboard-slate-50",
      )}
    >
      <Mail className="size-[18px] text-gb-onboard-slate-700" />
      Continue with Email
    </button>
  );
}

function OrDivider({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("relative w-full", compact ? "my-3" : "my-4")}>
      <div className="border-t border-gb-onboard-slate-200" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs font-medium text-gb-onboard-slate-400">
        or
      </span>
    </div>
  );
}


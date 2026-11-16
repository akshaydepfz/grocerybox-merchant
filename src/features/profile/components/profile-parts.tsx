"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  FolderTree,
  Settings,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { dashboardRoutePrefix } from "@/config/routes";
import { cn } from "@/lib/utils";

import {
  ONBOARDING_PROGRESS_STEPS,
  isOnboardingStepComplete,
  onboardingProgressPercent,
} from "../utils/onboarding-progress";
import type { MerchantOnboardingStatus } from "../types";

export function ProfileSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[#eceef2] bg-white p-3.5 shadow-[0_1px_3px_rgb(0_0_0_/0.04)] sm:rounded-2xl sm:p-6",
        className,
      )}
    >
      <div className="mb-3 flex flex-col gap-2.5 sm:mb-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-[#1a1f2e] sm:text-base">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-[11px] leading-relaxed text-[#6b7280] sm:mt-1 sm:text-xs">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
            {action}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function ProfileFieldGrid({ children }: { children: ReactNode }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-0 overflow-hidden rounded-xl border border-[#eceef2] bg-[#fafbfc]",
        "sm:gap-4 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent",
        "sm:grid-cols-2 lg:grid-cols-3",
        "[&>div]:border-b [&>div]:border-[#eceef2] [&>div]:px-3.5 [&>div]:py-3",
        "[&>div:last-child]:border-b-0",
        "sm:[&>div]:border-0 sm:[&>div]:px-0 sm:[&>div]:py-0",
      )}
    >
      {children}
    </dl>
  );
}

export function ProfileField({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-sm font-medium break-words text-[#1a1f2e] [overflow-wrap:anywhere]",
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function ProfileBadge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral";
  className?: string;
}) {
  const styles = {
    success: "bg-[#ecfdf3] text-[#15803d] border-[#bbf7d0]",
    warning: "bg-[#fffbeb] text-[#b45309] border-[#fde68a]",
    danger: "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]",
    neutral: "bg-[#f5f6f8] text-[#4b5563] border-[#e5e7eb]",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        styles,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProfileOnboardingProgress({
  status,
  storePublished,
}: {
  status: MerchantOnboardingStatus;
  storePublished: boolean;
}) {
  const percent = onboardingProgressPercent(status);

  return (
    <div className="rounded-xl border border-[#dcefe0] bg-gradient-to-br from-[#f0fdf4] to-white p-3.5 sm:rounded-2xl sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#16a34a] sm:text-xs">
            Onboarding progress
          </p>
          <p className="mt-0.5 text-xs text-[#4b5563] sm:mt-1 sm:text-sm">
            <span className="font-semibold text-[#1a1f2e]">
              {status.replaceAll("_", " ")}
            </span>
            <span className="text-[#6b7280]">
              {" "}
              · 8 steps to publish your store (not the profile page alone)
            </span>
          </p>
        </div>
        <p className="text-xl font-bold tabular-nums text-[#14532d] sm:text-2xl">{percent}%</p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e5efe8] sm:mt-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {ONBOARDING_PROGRESS_STEPS.map((step) => {
          const complete = isOnboardingStepComplete(status, step.status);
          const isPublishStep = step.status === "published";
          const publishedDone = storePublished && isPublishStep;
          const done = isPublishStep ? publishedDone : complete;

          return (
            <li
              key={step.status}
              className={cn(
                "flex min-w-[9.5rem] shrink-0 snap-start items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium sm:min-w-0",
                done
                  ? "border-[#bbf7d0] bg-white text-[#15803d]"
                  : "border-[#eceef2] bg-white/70 text-[#6b7280]",
              )}
            >
              {done ? (
                <CheckCircle2 className="size-4 shrink-0 text-[#16a34a]" />
              ) : (
                <Circle className="size-4 shrink-0 text-[#d1d5db]" />
              )}
              <span>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ProfileStatusRow({
  icon: Icon,
  label,
  enabled,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  enabled: boolean;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-[#eceef2] bg-[#fafbfc] px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#4b5563] shadow-sm sm:size-9">
          <Icon className="size-3.5 sm:size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#1a1f2e] sm:text-sm">{label}</p>
          {detail ? (
            <p className="text-[11px] text-[#6b7280] break-words [overflow-wrap:anywhere] sm:text-xs">
              {detail}
            </p>
          ) : null}
        </div>
      </div>
      <ProfileBadge
        variant={enabled ? "success" : "neutral"}
        className="shrink-0"
      >
        {enabled ? "On" : "Off"}
      </ProfileBadge>
    </div>
  );
}

export function ProfileImagePreview({
  src,
  alt,
  aspect = "square",
  fallbackLabel,
}: {
  src: string | null | undefined;
  alt: string;
  aspect?: "square" | "banner";
  fallbackLabel: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = src?.trim() ?? "";
  const showFallback = resolvedSrc.length === 0 || failed;

  if (showFallback) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-dashed border-[#d1d5db] bg-[#f9fafb] text-xs font-semibold text-[#9ca3af]",
          aspect === "banner" ? "h-28 w-full" : "mx-auto size-24 w-full max-w-[7rem] sm:mx-0 sm:w-24",
        )}
      >
        {fallbackLabel}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#eceef2] bg-[#f5f6f8]",
        aspect === "banner" ? "h-28 w-full" : "mx-auto size-24 w-full max-w-[7rem] sm:mx-0 sm:w-24",
      )}
    >
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        className="object-cover"
        sizes={aspect === "banner" ? "400px" : "96px"}
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function ColorSwatch({
  label,
  color,
}: {
  label: string;
  color: string | null | undefined;
}) {
  const value = color?.trim() || "#e5e7eb";
  return (
    <div className="flex items-center gap-3">
      <span
        className="size-10 rounded-lg border border-[#eceef2] shadow-inner"
        style={{ backgroundColor: value }}
        aria-hidden
      />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
          {label}
        </p>
        <p className="text-sm font-medium text-[#1a1f2e]">{value}</p>
      </div>
    </div>
  );
}

const PROFILE_QUICK_LINKS = [
  {
    href: `${dashboardRoutePrefix}/settings`,
    label: "Settings",
    icon: Settings,
  },
  {
    href: `${dashboardRoutePrefix}/coupons`,
    label: "Coupons",
    icon: Ticket,
  },
  {
    href: `${dashboardRoutePrefix}/categories`,
    label: "Categories",
    icon: FolderTree,
  },
] as const;

export function ProfileQuickLinks({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {PROFILE_QUICK_LINKS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-[44px] shrink-0 snap-start items-center gap-2 rounded-xl border border-[#eceef2] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#374151] shadow-sm transition active:scale-[0.98]"
          >
            <Icon className="size-4 text-[#16a34a]" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function CopyStoreLinkButton({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#dcefe0] bg-[#f0fdf4] px-3 py-2.5 text-xs font-semibold text-[#15803d] transition hover:bg-[#dcfce7] sm:py-1.5",
        className,
      )}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success("Store link copied");
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Could not copy link");
        }
      }}
    >
      {copied ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

export function OpenStoreLink({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#16a34a] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#15803d] sm:py-1.5",
        className,
      )}
    >
      Open store
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}

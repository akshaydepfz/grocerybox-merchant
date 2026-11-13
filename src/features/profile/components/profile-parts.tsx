"use client";

import Image from "next/image";
import {
  Check,
  CheckCircle2,
  Circle,
  Copy,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

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
        "rounded-2xl border border-[#eceef2] bg-white p-5 shadow-[0_1px_3px_rgb(0_0_0_/0.04)] sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1a1f2e]">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs text-[#6b7280]">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProfileFieldGrid({ children }: { children: ReactNode }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>
  );
}

export function ProfileField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-[#1a1f2e] break-words">
        {value}
      </dd>
    </div>
  );
}

export function ProfileBadge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral";
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
    <div className="rounded-2xl border border-[#dcefe0] bg-gradient-to-br from-[#f0fdf4] to-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#16a34a]">
            Onboarding progress
          </p>
          <p className="mt-1 text-sm text-[#4b5563]">
            Current step:{" "}
            <span className="font-semibold text-[#1a1f2e]">
              {status.replaceAll("_", " ")}
            </span>
          </p>
        </div>
        <p className="text-2xl font-bold text-[#14532d]">{percent}%</p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5efe8]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ONBOARDING_PROGRESS_STEPS.map((step) => {
          const complete = isOnboardingStepComplete(status, step.status);
          const isPublishStep = step.status === "published";
          const publishedDone = storePublished && isPublishStep;
          const done = isPublishStep ? publishedDone : complete;

          return (
            <li
              key={step.status}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium",
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#eceef2] bg-[#fafbfc] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-white text-[#4b5563] shadow-sm">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1a1f2e]">{label}</p>
          {detail ? (
            <p className="text-xs text-[#6b7280]">{detail}</p>
          ) : null}
        </div>
      </div>
      <ProfileBadge variant={enabled ? "success" : "neutral"}>
        {enabled ? "Enabled" : "Disabled"}
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
          aspect === "banner" ? "h-28 w-full" : "size-24",
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
        aspect === "banner" ? "h-28 w-full" : "size-24",
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

export function CopyStoreLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#dcefe0] bg-[#f0fdf4] px-3 py-1.5 text-xs font-semibold text-[#15803d] transition hover:bg-[#dcfce7]"
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

export function OpenStoreLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg bg-[#16a34a] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#15803d]"
    >
      Open store
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}

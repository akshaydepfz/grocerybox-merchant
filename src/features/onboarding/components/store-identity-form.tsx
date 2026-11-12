"use client";

import {
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Home,
  Info,
  Loader2,
  Lock,
  Store,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import type { StoreSubdomainAvailability } from "../types/store-identity";
import {
  MAX_DESCRIPTION_LENGTH,
  normalizeSubdomain,
  validateSubdomainFormat,
} from "../validators/store-identity-validator";

import { MerchantFieldLabel, MerchantIconTextField } from "./merchant-form-fields";

type StoreIdentityFormProps = {
  storeName: string;
  subdomain: string;
  description: string;
  onStoreNameChange: (value: string) => void;
  onSubdomainChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  slugAvailability: StoreSubdomainAvailability;
};

export function StoreIdentityForm({
  storeName,
  subdomain,
  description,
  onStoreNameChange,
  onSubdomainChange,
  onDescriptionChange,
  slugAvailability,
}: StoreIdentityFormProps) {
  const twoCol = useMediaQuery("(min-width: 640px)");

  const normalizedSlug = normalizeSubdomain(subdomain);
  const previewHost = `${normalizedSlug || "subdomain"}.grocery.in`;
  const previewName = storeName.trim() || "Your Store";
  const previewTagline = previewDescription(description);

  const showCheckmark = slugAvailability === "available";

  return (
    <div className="space-y-6">
      {twoCol ? (
        <div className="grid grid-cols-2 gap-6">
          <StoreNameField value={storeName} onChange={onStoreNameChange} />
          <SubdomainField
            value={subdomain}
            onChange={onSubdomainChange}
            showCheckmark={showCheckmark}
            availability={slugAvailability}
          />
        </div>
      ) : (
        <div className="space-y-5">
          <StoreNameField value={storeName} onChange={onStoreNameChange} />
          <SubdomainField
            value={subdomain}
            onChange={onSubdomainChange}
            showCheckmark={showCheckmark}
            availability={slugAvailability}
          />
        </div>
      )}

      <DescriptionField
        value={description}
        onChange={onDescriptionChange}
        maxLength={MAX_DESCRIPTION_LENGTH}
      />

      <StoreUrlPreview
        host={previewHost}
        storeName={previewName}
        tagline={previewTagline}
      />
    </div>
  );
}

function StoreNameField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FieldBlock>
      <MerchantFieldLabel label="Store Name" required />
      <MerchantIconTextField
        icon={Store}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter store name"
      />
    </FieldBlock>
  );
}

function FieldBlock({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function SubdomainField({
  value,
  onChange,
  showCheckmark,
  availability,
}: {
  value: string;
  onChange: (value: string) => void;
  showCheckmark: boolean;
  availability: StoreSubdomainAvailability;
}) {
  return (
    <FieldBlock>
      <MerchantFieldLabel label="Store URL (Subdomain)" required />
      <div className="flex overflow-hidden rounded-xl border border-gb-mo-input-border bg-white">
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="subdomain"
            className="w-full px-4 py-3.5 text-sm font-medium text-gb-mo-gray-800 outline-none placeholder:text-gb-mo-gray-400"
          />
          {showCheckmark ? (
            <span className="absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-gb-onboard-brand">
              <Check className="size-3.5 text-white" strokeWidth={3} />
            </span>
          ) : null}
        </div>
        <SubdomainSuffix className="border-l border-gb-mo-gray-200 bg-[#E8F9C1] px-4 py-3.5 text-xs font-bold text-gb-mo-gray-900">
          .grocery.in
        </SubdomainSuffix>
      </div>
      <SlugAvailabilityMessage availability={availability} subdomain={value} />
    </FieldBlock>
  );
}

function SubdomainSuffix({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function SlugAvailabilityMessage({
  availability,
  subdomain,
}: {
  availability: StoreSubdomainAvailability;
  subdomain: string;
}) {
  if (availability === "idle") {
    return null;
  }

  if (availability === "checking") {
    return (
      <AvailabilityRow className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gb-mo-gray-600">
        <Loader2 className="size-4 animate-spin text-gb-mo-gray-500" />
        Checking subdomain availability...
      </AvailabilityRow>
    );
  }

  if (availability === "available") {
    return (
      <AvailabilityRow className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gb-onboard-brand-dark">
        <CheckCircle2 className="size-4" />
        This subdomain is available!
      </AvailabilityRow>
    );
  }

  if (availability === "unavailable") {
    return (
      <AvailabilityRow className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
        <XCircle className="size-4" />
        This subdomain is already taken.
      </AvailabilityRow>
    );
  }

  const slug = normalizeSubdomain(subdomain);
  if (slug.length === 0) {
    return null;
  }
  const message =
    validateSubdomainFormat(slug) ?? "Enter a valid subdomain.";

  return (
    <AvailabilityRow className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-red-600">
      <Info className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </AvailabilityRow>
  );
}

function AvailabilityRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={className}>{children}</p>;
}

function DescriptionField({
  value,
  onChange,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}) {
  return (
    <FieldBlock>
      <MerchantFieldLabel label="Store Description" required />
      <DescriptionBox className="rounded-xl border border-gb-mo-input-border bg-white p-3">
        <div className="flex gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-gb-mo-gray-600" />
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={maxLength}
            rows={3}
            placeholder="Describe your grocery store..."
            className="min-h-[72px] w-full resize-y text-sm leading-relaxed text-gb-mo-gray-800 outline-none placeholder:text-gb-mo-gray-400"
          />
        </div>
        <p className="text-right text-[11px] font-medium text-gb-mo-gray-400">
          {value.length} / {maxLength}
        </p>
      </DescriptionBox>
    </FieldBlock>
  );
}

function DescriptionBox({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function StoreUrlPreview({
  host,
  storeName,
  tagline,
}: {
  host: string;
  storeName: string;
  tagline: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Eye className="size-4 text-gb-mo-gray-700" />
        <span className="text-xs font-bold text-gb-mo-gray-900">
          Your Store URL Preview
        </span>
      </div>
      <PreviewCard className="overflow-hidden rounded-2xl border border-green-200 bg-[#F9FEF5]">
        <div className="border-b border-green-100 bg-white/80 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <TrafficDot color="#F87171" />
              <TrafficDot color="#FBBF24" />
              <TrafficDot color="#4ADE80" />
            </div>
            <div className="flex min-w-0 flex-1 justify-center">
              <PreviewUrl className="flex max-w-full items-center gap-1.5 rounded-full border border-gb-mo-gray-100 bg-white px-4 py-1.5">
                <Lock className="size-3.5 shrink-0 text-gb-mo-gray-400" />
                <p className="truncate text-xs text-gb-mo-gray-600">
                  https://
                  <span className="font-bold text-gb-mo-gray-900">{host}</span>
                </p>
              </PreviewUrl>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6">
          <PreviewLogoBox className="flex size-14 items-center justify-center rounded-2xl border border-green-100 bg-white">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gb-onboard-brand">
              <Home className="size-6 text-white" />
            </div>
          </PreviewLogoBox>
          <PreviewCopy>
            <p className="text-xl font-extrabold text-gb-mo-gray-900">
              {storeName}
            </p>
            <p className="mt-1 text-xs font-medium text-gb-mo-gray-500">
              {tagline}
            </p>
          </PreviewCopy>
        </div>
      </PreviewCard>
    </div>
  );
}

function PreviewCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function PreviewUrl({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function PreviewLogoBox({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function PreviewCopy({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-1">{children}</div>;
}

function TrafficDot({ color }: { color: string }) {
  return (
    <span
      className="size-2.5 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

function previewDescription(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return "Your store description will appear here.";
  }
  const firstSentence = trimmed.split(".")[0]?.trim() ?? "";
  if (firstSentence.length === 0) {
    return trimmed;
  }
  return firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`;
}

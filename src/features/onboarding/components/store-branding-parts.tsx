"use client";

import { Check, ChevronDown, CloudUpload, Eye, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { MerchantFieldLabel } from "./merchant-form-fields";

export function UploadActions({
  enabled,
  onChange,
  onDelete,
}: {
  enabled: boolean;
  onChange: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex w-full max-w-full flex-col gap-2 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!enabled}
        onClick={onChange}
        className="h-8 w-full min-w-0 shrink gap-1.5 text-xs font-semibold sm:w-auto sm:shrink-0"
      >
        <Upload className="size-3.5" />
        Change
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!enabled}
        onClick={onDelete}
        className="h-8 w-full min-w-0 shrink px-2 text-red-600 sm:w-auto sm:shrink-0"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function EmptyUploadPrompt({
  label,
  enabled,
  onUpload,
}: {
  label: string;
  enabled: boolean;
  onUpload: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onUpload}
      className="flex w-full flex-col items-center py-6 disabled:opacity-50"
    >
      <CloudUpload className="size-8 text-gb-mo-gray-400" />
      <span className="mt-2 text-sm font-semibold text-gb-mo-gray-600">
        {label}
      </span>
    </button>
  );
}

export function LogoUploadCard({
  hasLogo,
  displayName,
  logoSrc,
  primaryHex,
  isLoading,
  isUploading,
  uploadProgress,
  isBusy,
  onUpload,
  onChange,
  onDelete,
}: {
  hasLogo: boolean;
  displayName: string;
  logoSrc: string | null;
  primaryHex: string;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  isBusy: boolean;
  onUpload: () => void;
  onChange: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="min-w-0 max-w-full">
      <MerchantFieldLabel label="Store Logo" required />
      <div className="max-w-full overflow-hidden rounded-2xl border border-gb-mo-gray-200 bg-white p-3.5 sm:p-4">
        {hasLogo ? (
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-3.5">
            <span className="relative mx-auto flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#D2F3A4] bg-[#EAF7D7] sm:mx-0">
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span
                  className="flex size-10 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: primaryHex }}
                >
                  🏪
                </span>
              )}
            </span>
            <div className="min-w-0 w-full max-w-full flex-1 text-center sm:text-left">
              <span className="flex max-w-full items-center justify-center gap-1.5 sm:justify-start">
                <span className="min-w-0 truncate text-sm font-bold text-gb-mo-gray-900">
                  {displayName}
                </span>
                {logoSrc ? (
                  <span className="flex size-4 items-center justify-center rounded-full bg-gb-onboard-brand-dark">
                    <Check className="size-2.5 text-white" strokeWidth={3} />
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug break-words text-gb-mo-gray-400 sm:text-xs">
                512×512 px · PNG, JPG, WebP · max 5 MB
              </span>
              {isUploading && uploadProgress > 0 ? (
                <span className="mt-2 block h-1 overflow-hidden rounded bg-gb-mo-gray-100">
                  <span
                    className="block h-full bg-gb-mo-progress-fill transition-all"
                    style={{ width: `${uploadProgress * 100}%` }}
                  />
                </span>
              ) : null}
              <span className="mt-2 flex w-full max-w-full justify-center sm:justify-start">
                <UploadActions
                  enabled={!isBusy}
                  onChange={onChange}
                  onDelete={onDelete}
                />
              </span>
            </div>
          </div>
        ) : (
          <EmptyUploadPrompt
            label={isLoading ? "Loading store logo..." : "Upload store logo"}
            enabled={!isBusy && !isLoading}
            onUpload={onUpload}
          />
        )}
      </div>
    </div>
  );
}

export function BannerUploadCard({
  hasBanner,
  displayName,
  bannerSrc,
  primaryHex,
  secondaryHex,
  isLoading,
  isUploading,
  uploadProgress,
  isBusy,
  onUpload,
  onChange,
  onDelete,
}: {
  hasBanner: boolean;
  displayName: string;
  bannerSrc: string | null;
  primaryHex: string;
  secondaryHex: string;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  isBusy: boolean;
  onUpload: () => void;
  onChange: () => void;
  onDelete: () => void;
}) {
  return (
    <BannerCard>
      <MerchantFieldLabel label="Store Banner" optional />
      <BannerInner className="max-w-full overflow-hidden rounded-2xl border border-gb-mo-gray-200 bg-white p-3">
        {hasBanner ? (
          <div className="min-w-0">
            <div className="relative mb-2.5 h-16 w-full max-w-full overflow-hidden rounded-xl">
              {bannerSrc ? (
                <Image
                  src={bannerSrc}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <DefaultBannerGradient
                  primaryHex={primaryHex}
                  secondaryHex={secondaryHex}
                />
              )}
            </div>
            {isUploading && uploadProgress > 0 ? (
              <span className="mb-2 block h-1 overflow-hidden rounded bg-gb-mo-gray-100">
                <span
                  className="block h-full bg-gb-mo-progress-fill"
                  style={{ width: `${uploadProgress * 100}%` }}
                />
              </span>
            ) : null}
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 text-[10px] leading-snug break-words text-gb-mo-gray-400 sm:text-xs">
                <span className="font-medium break-all text-gb-mo-gray-600">
                  {displayName}
                </span>
                <span className="block sm:inline">
                  {" "}
                  1440×480 px · max 10 MB
                </span>
              </span>
              <UploadActions
                enabled={!isBusy}
                onChange={onChange}
                onDelete={onDelete}
              />
            </div>
          </div>
        ) : (
          <EmptyUploadPrompt
            label={
              isLoading ? "Loading store banner..." : "Upload banner (optional)"
            }
            enabled={!isBusy && !isLoading}
            onUpload={onUpload}
          />
        )}
      </BannerInner>
    </BannerCard>
  );
}

function BannerCard({ children }: { children: ReactNode }) {
  return <div className="min-w-0 max-w-full">{children}</div>;
}

function BannerInner({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function DefaultBannerGradient({
  primaryHex,
  secondaryHex,
}: {
  primaryHex: string;
  secondaryHex: string;
}) {
  return (
    <div
      className="flex h-full min-w-0 items-center justify-between gap-2 overflow-hidden px-2 text-white sm:px-4"
      style={{
        background: `linear-gradient(90deg, ${primaryHex}f2, #166534)`,
      }}
    >
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-black sm:text-[13px]">
          Fresh Groceries
        </span>
        <span
          className="block truncate text-[10px] font-semibold sm:text-[11px]"
          style={{ color: secondaryHex }}
        >
          at Your Doorstep
        </span>
      </span>
      <span className="hidden shrink-0 text-lg sm:inline sm:text-xl">🥦🍎🍌🥛</span>
    </div>
  );
}

export function BrandColorSelector({
  label,
  required,
  hex,
  onClick,
  disabled,
}: {
  label: string;
  required?: boolean;
  hex: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <BrandColorField>
      <MerchantFieldLabel label={label} required={required} />
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="flex w-full max-w-full min-w-0 items-center gap-2.5 rounded-xl border border-gb-mo-gray-200 bg-white px-3 py-2.5 text-left disabled:opacity-50"
      >
        <span
          className="size-6 shrink-0 rounded-md border border-black/10"
          style={{ backgroundColor: hex }}
        />
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-gb-mo-gray-900">
          {hex}
        </span>
        <ChevronDown className="size-4 text-gb-mo-gray-400" />
      </button>
    </BrandColorField>
  );
}

function BrandColorField({ children }: { children: ReactNode }) {
  return <div className="min-w-0 max-w-full">{children}</div>;
}

export function QuickPickSwatches({
  selectedIndex,
  disabled,
  onSelect,
}: {
  selectedIndex: number;
  disabled?: boolean;
  onSelect: (index: number) => void;
}) {
  const colors = [
    "#16A34A",
    "#D4FF3F",
    "#FACC15",
    "#F97316",
    "#EF4444",
  ] as const;
  return (
    <QuickPickField>
      <MerchantFieldLabel label="Quick Picks" />
      <QuickPickWrap className="-mx-0.5 flex max-w-full flex-wrap gap-2 px-0.5 py-1">
        {colors.map((color, index) => (
          <button
            key={color}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(index)}
            className={cn(
              "size-6 shrink-0 rounded-full disabled:opacity-50",
              selectedIndex === index && "ring-2 ring-offset-1 sm:ring-offset-2",
            )}
            style={{
              backgroundColor: color,
              ...(selectedIndex === index
                ? ({ ringColor: color } as React.CSSProperties)
                : {}),
            }}
            aria-label={`Quick pick ${index + 1}`}
          />
        ))}
      </QuickPickWrap>
    </QuickPickField>
  );
}

function QuickPickField({ children }: { children: ReactNode }) {
  return <div className="min-w-0 max-w-full">{children}</div>;
}

function QuickPickWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function StoreBrandingPreview({
  storeName,
  primaryHex,
  secondaryHex,
  hasBanner,
  logoSrc,
  bannerSrc,
}: {
  storeName: string;
  primaryHex: string;
  secondaryHex: string;
  hasBanner: boolean;
  logoSrc: string | null;
  bannerSrc: string | null;
}) {
  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-[#DEEDD9] bg-[#F6FAF4] p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 sm:mb-4">
        <Eye className="size-4 text-gb-mo-gray-700" />
        <span className="text-xs font-bold text-gb-mo-gray-900">Store Preview</span>
      </div>
      <div className="max-w-full overflow-hidden rounded-xl border border-gb-mo-gray-100 bg-white p-2.5 sm:p-3">
        <div className="flex min-w-0 flex-col gap-2.5 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="relative size-8 shrink-0 overflow-hidden rounded-lg"
              style={{ backgroundColor: `${secondaryHex}59` }}
            >
              {logoSrc ? (
                <Image src={logoSrc} alt="" fill unoptimized className="object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center">🛍️</span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-gb-mo-gray-900">
                {storeName}
              </span>
              <span className="text-[10px] text-gb-mo-gray-400">
                Grocery & Daily Essentials
              </span>
            </span>
          </div>
          <span className="flex w-full items-center justify-between gap-2 sm:ml-auto sm:w-auto sm:justify-end">
            <span className="min-w-0 flex-1 rounded-full border border-gb-mo-gray-200 bg-gb-mo-gray-100 px-2 py-1 text-[10px] text-gb-mo-gray-400 sm:flex-none">
              Search…
            </span>
            <span
              className="relative flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ backgroundColor: primaryHex }}
            >
              0
            </span>
          </span>
        </div>
        {hasBanner ? (
          <span className="relative mt-3 block h-24 overflow-hidden rounded-xl sm:h-28">
            {bannerSrc ? (
              <Image src={bannerSrc} alt="" fill unoptimized className="object-cover" />
            ) : (
              <DefaultBannerGradient primaryHex={primaryHex} secondaryHex={secondaryHex} />
            )}
          </span>
        ) : null}
      </div>
    </div>
  );
}

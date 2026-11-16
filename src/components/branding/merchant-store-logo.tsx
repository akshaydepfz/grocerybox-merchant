"use client";

import { Store } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { useMerchantProfileQuery } from "@/features/profile/hooks/use-merchant-profile";
import { cn } from "@/lib/utils";

export type MerchantStoreLogoProps = {
  size: number;
  className?: string;
  alt?: string;
  /** When provided, skips the profile query for logo / name. */
  logoUrl?: string | null;
  storeName?: string | null;
  imageClassName?: string;
};

export function MerchantStoreLogo({
  size,
  className,
  alt,
  logoUrl: logoUrlProp,
  storeName: storeNameProp,
  imageClassName,
}: MerchantStoreLogoProps) {
  const profileQuery = useMerchantProfileQuery();
  const [imageFailed, setImageFailed] = useState(false);

  const store = profileQuery.data?.store;
  const business = profileQuery.data?.business;
  const branding = profileQuery.data?.branding;

  const storeName =
    storeNameProp?.trim() ||
    store?.storeName?.trim() ||
    business?.businessName?.trim() ||
    "Store";

  const logoUrl =
    logoUrlProp !== undefined
      ? logoUrlProp?.trim() ?? ""
      : branding?.logoUrl?.trim() ?? "";

  const resolvedAlt = alt ?? `${storeName} logo`;
  const initial = storeName.charAt(0).toUpperCase() || "S";
  const showImage = logoUrl.length > 0 && !imageFailed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f0fdf4]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={logoUrl}
          alt={resolvedAlt}
          fill
          sizes={`${size}px`}
          className={cn("object-contain p-0.5", imageClassName)}
          unoptimized
          onError={() => setImageFailed(true)}
        />
      ) : initial.length > 0 && initial !== "S" ? (
        <span
          className="flex size-full items-center justify-center bg-gradient-to-br from-[#16a34a] to-[#0a3d32] font-bold text-white"
          style={{ fontSize: Math.max(12, Math.round(size * 0.38)) }}
          aria-hidden
        >
          {initial}
        </span>
      ) : (
        <Store
          className="text-[#16a34a]"
          style={{ width: size * 0.45, height: size * 0.45 }}
          aria-hidden
        />
      )}
    </span>
  );
}
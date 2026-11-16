"use client";

import { Check, Copy, ExternalLink, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { MerchantStoreLogo } from "@/components/branding/merchant-store-logo";
import { Button } from "@/components/ui/button";
import { merchantStorePublicUrl, merchantStoreSubdomainHost } from "@/config/store-domain";
import { dashboardRoutePrefix } from "@/config/routes";
import { useMerchantProfileQuery } from "@/features/profile/hooks/use-merchant-profile";
import { cn } from "@/lib/utils";

function StoreStatusBadge({ online }: { online: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs",
        online
          ? "bg-[#dcfce7] text-[#15803d]"
          : "bg-[#fef3c7] text-[#b45309]",
      )}
    >
      <span className="relative flex size-2">
        {online ? (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#22c55e] opacity-40" />
        ) : null}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            online ? "bg-[#22c55e]" : "bg-[#f59e0b]",
          )}
        />
      </span>
      {online ? "Online" : "Offline"}
    </span>
  );
}

export function DashboardStorefrontCard({ className }: { className?: string }) {
  const profileQuery = useMerchantProfileQuery();
  const [copied, setCopied] = useState(false);

  const store = profileQuery.data?.store;
  const business = profileQuery.data?.business;
  const storePublished = profileQuery.data?.storePublished ?? false;

  const storeName =
    store?.storeName?.trim() ||
    business?.businessName?.trim() ||
    "Your store";

  const subdomain = store?.subdomain?.trim() ?? "";
  const storeHost = subdomain
    ? merchantStoreSubdomainHost(subdomain)
    : "Add a subdomain in profile";
  const storefrontUrl = subdomain ? merchantStorePublicUrl(subdomain) : null;

  const copyLink = async () => {
    if (!storefrontUrl) {
      toast.error("Set your store subdomain to get a shareable link.");
      return;
    }
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      setCopied(true);
      toast.success("Store link copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-[#dcefe0] bg-gradient-to-br from-[#f0fdf4] via-white to-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <MerchantStoreLogo
          size={48}
          className="shrink-0 rounded-xl border border-[#dcfce7] bg-white shadow-sm"
          storeName={storeName}
          logoUrl={profileQuery.data?.branding?.logoUrl}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-bold text-[#1a1f2e] sm:text-base">
              {storeName}
            </p>
            <StoreStatusBadge online={storePublished} />
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[#6b7280]">
            <Globe className="size-3.5 shrink-0 text-[#16a34a]" aria-hidden />
            <p className="truncate font-mono text-xs text-[#14532d] sm:text-sm">
              {storeHost}
            </p>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-[#9ca3af] sm:hidden">
            {storePublished
              ? "Customers can browse and order on your live storefront."
              : "Publish your store to appear online at this address."}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        {storefrontUrl ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 flex-1 rounded-xl border-[#dcefe0] bg-white/80 text-xs font-semibold text-[#15803d] hover:bg-white sm:h-9 sm:flex-none"
            onClick={() => void copyLink()}
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Copy className="size-3.5" aria-hidden />
            )}
            {copied ? "Copied" : "Copy link"}
          </Button>
        ) : null}

        {storePublished && storefrontUrl ? (
          <Button
            type="button"
            size="sm"
            className="h-10 flex-1 rounded-xl bg-[#16a34a] text-xs font-semibold text-white hover:bg-[#15803d] sm:h-9 sm:flex-none"
            asChild
          >
            <a href={storefrontUrl} target="_blank" rel="noopener noreferrer">
              View store
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="default"
            className="h-10 w-full rounded-xl bg-[#0a3d32] text-xs font-semibold text-white hover:bg-[#062f27] sm:h-9 sm:w-auto"
            asChild
          >
            <Link href={`${dashboardRoutePrefix}/profile`}>
              {storefrontUrl ? "Finish publishing" : "Set up storefront"}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
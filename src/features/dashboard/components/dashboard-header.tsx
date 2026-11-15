"use client";

import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";

import { AppLogoImage } from "@/components/branding/app-logo";
import { merchantStoreSubdomainHost } from "@/config/store-domain";
import { dashboardRoutePrefix } from "@/config/routes";
import { useMerchantProfileQuery } from "@/features/profile/hooks/use-merchant-profile";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function displayNameFromEmail(email: string | undefined): string {
  if (!email) return "Merchant";
  const local = email.split("@")[0] ?? email;
  const first = local.split(/[._-]/)[0] ?? local;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function DashboardHeader({ className }: { className?: string }) {
  const session = useAuthStore((s) => s.session);
  const profileQuery = useMerchantProfileQuery();
  const profileName =
    profileQuery.data?.account?.fullName?.trim() || displayNameFromEmail(session?.email);
  const greeting = greetingForHour(new Date().getHours());

  const storeName =
    profileQuery.data?.store?.storeName?.trim() ||
    profileQuery.data?.business?.businessName?.trim() ||
    "Your store";
  const subdomain = profileQuery.data?.store?.subdomain?.trim() ?? "";
  const storeHost = subdomain ? merchantStoreSubdomainHost(subdomain) : "Publish to go live";

  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#16a34a] lg:hidden">{storeName}</p>
        <h1 className="text-xl font-bold tracking-tight text-[#1a1f2e] sm:text-2xl">
          {greeting}, {profileName} 👋
        </h1>
        <p className="mt-0.5 text-xs text-[#6b7280] sm:mt-1 sm:text-sm">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <div className="hidden flex-wrap items-center gap-2 sm:flex sm:gap-3 lg:flex">
        <Link
          href={`${dashboardRoutePrefix}/profile`}
          className="flex items-center gap-2.5 rounded-2xl border border-[#e8eaef] bg-white px-3 py-2 shadow-sm transition hover:bg-[#fafbfc]"
        >
          <AppLogoImage size={32} className="rounded-lg" />
          <div className="text-left">
            <p className="text-xs font-semibold text-[#1a1f2e]">{storeName}</p>
            <p className="text-[10px] text-[#9ca3af]">{storeHost}</p>
          </div>
          <ChevronDown className="size-4 text-[#9ca3af]" />
        </Link>

        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-xl border border-[#e8eaef] bg-white shadow-sm"
          aria-label="Notifications"
          disabled
        >
          <Bell className="size-[18px] text-[#4b5563]" />
        </button>

        <Link
          href={`${dashboardRoutePrefix}/profile`}
          className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#16a34a] to-[#0a3d32] text-sm font-semibold text-white ring-2 ring-white"
          title={session?.email ?? "Profile"}
        >
          {profileName.charAt(0)}
        </Link>
      </div>
    </header>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { AppLogoImage } from "@/components/branding/app-logo";
import { useAuth } from "@/features/auth/components/auth-provider";
import { signOutAndClearWebSession } from "@/features/auth/services/auth-service";
import { merchantStoreSubdomainHost } from "@/config/store-domain";
import { dashboardRoutePrefix } from "@/config/routes";
import { useMerchantProfileQuery } from "@/features/profile/hooks/use-merchant-profile";
import { cn } from "@/lib/utils";

import {
  DASHBOARD_MORE_MENU_ITEMS,
  isDashboardNavActive,
} from "../constants/nav-items";
import { DashboardPage } from "./dashboard-page";

const MENU_SECTIONS: {
  title: string;
  itemIds: string[];
}[] = [
  {
    title: "Catalog",
    itemIds: ["categories", "coupons", "inventory"],
  },
  {
    title: "Customers & insights",
    itemIds: ["customers", "analytics"],
  },
  {
    title: "Store & account",
    itemIds: ["settings", "payments", "team", "help"],
  },
];

function itemsForSection(sectionIds: string[]) {
  const byId = new Map(DASHBOARD_MORE_MENU_ITEMS.map((item) => [item.id, item]));
  return sectionIds
    .map((id) => byId.get(id))
    .filter((item): item is (typeof DASHBOARD_MORE_MENU_ITEMS)[number] => Boolean(item));
}

export function DashboardMoreScreen() {
  const pathname = usePathname();
  const { user } = useAuth();
  const profileQuery = useMerchantProfileQuery();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const storeName =
    profileQuery.data?.store?.storeName?.trim() ||
    profileQuery.data?.business?.businessName?.trim() ||
    "Your store";
  const subdomain = profileQuery.data?.store?.subdomain?.trim() ?? "";
  const storeHost = subdomain ? merchantStoreSubdomainHost(subdomain) : null;

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOutAndClearWebSession();
    } catch {
      setIsLoggingOut(false);
      toast.error("Could not sign out. Please try again.");
    }
  }, [isLoggingOut]);

  if (!user) {
    return (
      <DashboardPage>
        <p className="text-sm text-[#6b7280]">Sign in to open the menu.</p>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage className="gap-4 pb-4">
      <header className="flex items-center gap-3 rounded-2xl border border-[#eceef2] bg-white p-4 shadow-sm">
        <AppLogoImage size={44} className="rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#1a1f2e]">{storeName}</p>
          <p className="truncate text-xs text-[#6b7280]">
            {storeHost ?? "GroceryBox Merchant"}
          </p>
        </div>
        <Link
          href={`${dashboardRoutePrefix}/profile`}
          className="shrink-0 rounded-full bg-gradient-to-br from-[#16a34a] to-[#0a3d32] px-3 py-1.5 text-xs font-semibold text-white"
        >
          Profile
        </Link>
      </header>

      <p className="px-0.5 text-xs font-medium text-[#9ca3af]">
        Shortcuts to catalog, customers, and store settings.
      </p>

      {MENU_SECTIONS.map((section) => {
        const items = itemsForSection(section.itemIds);
        if (items.length === 0) return null;

        return (
          <section key={section.title} className="flex flex-col gap-2.5">
            <h2 className="px-0.5 text-[11px] font-bold uppercase tracking-wide text-[#9ca3af]">
              {section.title}
            </h2>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
              {items.map((item) => (
                <li key={item.id}>
                  <MoreMenuTile item={item} pathname={pathname} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className={cn(
            "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#b91c1c] transition active:scale-[0.99]",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isLoggingOut ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <LogOut className="size-4" aria-hidden />
          )}
          {isLoggingOut ? "Signing out…" : "Log out"}
        </button>
      </section>
    </DashboardPage>
  );
}

function MoreMenuTile({
  item,
  pathname,
}: {
  item: (typeof DASHBOARD_MORE_MENU_ITEMS)[number];
  pathname: string;
}) {
  const Icon = item.icon;
  const isActive = isDashboardNavActive(pathname, item);

  const tileClass = cn(
    "flex min-h-[96px] w-full flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center transition active:scale-[0.97]",
    item.available
      ? "border-[#eceef2] bg-white shadow-sm hover:border-[#d1fae5] hover:bg-[#f0fdf4]"
      : "cursor-default border-dashed border-[#e5e7eb] bg-[#fafbfc] opacity-70",
    isActive && item.available && "border-[#16a34a] bg-[#f0fdf4] ring-1 ring-[#16a34a]/20",
  );

  const inner = (
    <>
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl",
          item.available ? "bg-[#f0fdf4] text-[#16a34a]" : "bg-[#f3f4f6] text-[#9ca3af]",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span
        className={cn(
          "line-clamp-2 text-[11px] font-semibold leading-tight",
          item.available ? "text-[#1a1f2e]" : "text-[#9ca3af]",
        )}
      >
        {item.label}
      </span>
      {!item.available ? (
        <span className="text-[9px] font-bold uppercase tracking-wide text-[#9ca3af]">
          Soon
        </span>
      ) : null}
    </>
  );

  if (!item.available) {
    return (
      <div className={tileClass} aria-disabled>
        {inner}
      </div>
    );
  }

  return (
    <Link href={item.href} className={tileClass} aria-current={isActive ? "page" : undefined}>
      {inner}
    </Link>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, Loader2, LogOut } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { MerchantStoreLogo } from "@/components/branding/merchant-store-logo";
import { Button } from "@/components/ui/button";
import { signOutAndClearWebSession } from "@/features/auth/services/auth-service";
import { useMerchantProfileQuery } from "@/features/profile/hooks/use-merchant-profile";
import { cn } from "@/lib/utils";

import { useDeliveryBoyManagementEnabled } from "@/features/profile/hooks/use-delivery-boy-management";

import { DASHBOARD_NAV_ITEMS, isDashboardNavActive } from "../constants/nav-items";
import { dashboardNavItemsForPlan } from "../utils/dashboard-nav-for-plan";

type DashboardSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function DashboardSidebar({
  onNavigate,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const profileQuery = useMerchantProfileQuery();
  const deliveryBoyManagement = useDeliveryBoyManagementEnabled();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = dashboardNavItemsForPlan(DASHBOARD_NAV_ITEMS, {
    deliveryBoyManagement,
  });

  const storeName =
    profileQuery.data?.store?.storeName?.trim() ||
    profileQuery.data?.business?.businessName?.trim() ||
    "Your store";

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    onNavigate?.();
    try {
      await signOutAndClearWebSession();
    } catch {
      setIsLoggingOut(false);
      toast.error("Could not sign out. Please try again.");
    }
  }, [isLoggingOut, onNavigate]);

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-[#0a3d32] text-white",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-6">
        <MerchantStoreLogo
          size={36}
          className="rounded-lg bg-white/10"
          storeName={storeName}
          logoUrl={profileQuery.data?.branding?.logoUrl}
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{storeName}</p>
          <p className="text-[11px] text-white/60">Merchant dashboard</p>
        </div>
      </div>

      <nav
        className="flex-1 space-y-0.5 overflow-y-auto px-3"
        aria-label="Main"
      >
        {navItems.map((item) => {
          const isActive = isDashboardNavActive(pathname, item);
          const Icon = item.icon;

          const row = (
            <>
              <Icon className="size-[18px] shrink-0 opacity-90" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge != null ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-[#bef264] text-[10px] font-bold text-[#0a3d32]">
                  {item.badge}
                </span>
              ) : null}
            </>
          );

          const itemClasses = cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-white/15 text-white"
              : "text-white/75 hover:bg-white/10 hover:text-white",
            !item.available && !isActive && "opacity-90",
          );

          if (!item.available) {
            return (
              <span
                key={item.id}
                className={cn(itemClasses, "cursor-default")}
              >
                {row}
              </span>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              className={itemClasses}
              aria-current={isActive ? "page" : undefined}
            >
              {row}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-3 p-4">
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium transition-colors",
            "text-white/80 hover:bg-white/10 hover:text-white",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isLoggingOut ? (
            <Loader2 className="size-[18px] shrink-0 animate-spin" aria-hidden />
          ) : (
            <LogOut className="size-[18px] shrink-0 opacity-90" aria-hidden />
          )}
          {isLoggingOut ? "Signing out…" : "Log out"}
        </button>
        <div className="rounded-2xl bg-[#062f27] p-4">
          <div className="flex items-start gap-2">
            <Crown className="size-4 shrink-0 text-amber-400" aria-hidden />
            <div>
              <p className="text-sm font-semibold">Upgrade to Pro</p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">
                Unlock advanced analytics and priority support.
              </p>
            </div>
          </div>
          <Button
            type="button"
            className="mt-3 h-9 w-full rounded-xl bg-[#bef264] text-xs font-semibold text-[#0a3d32] hover:bg-[#a8e84a]"
            disabled
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown } from "lucide-react";

import { AppLogoImage } from "@/components/branding/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DASHBOARD_NAV_ITEMS } from "../constants/nav-items";

type DashboardSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function DashboardSidebar({
  onNavigate,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col bg-[#0a3d32] text-white",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-6">
        <AppLogoImage size={36} className="rounded-lg bg-white/10 p-1" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">GroceryBox</p>
          <p className="text-[11px] text-white/60">Merchant</p>
        </div>
      </div>

      <nav
        className="flex-1 space-y-0.5 overflow-y-auto px-3"
        aria-label="Main"
      >
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive =
            item.id === "dashboard"
              ? pathname === item.href
              : item.href === pathname ||
                pathname.startsWith(`${item.href}/`);
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

      <div className="shrink-0 p-4">
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

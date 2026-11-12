"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GroceryBrandLogo } from "@/components/branding/app-logo";
import { cn } from "@/lib/utils";

import { DASHBOARD_NAV_ITEMS } from "../constants/nav-items";

type DashboardSidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function DashboardSidebar({
  collapsed = false,
  onNavigate,
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col bg-gb-mo-sidebar", className)}>
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-gb-mo-address-border",
          collapsed ? "justify-center px-2" : "px-5",
        )}
      >
        {collapsed ? (
          <GroceryBrandLogo size="compact" className="scale-90" />
        ) : (
          <GroceryBrandLogo size="default" />
        )}
      </div>

      <nav
        className={cn("flex-1 space-y-1 overflow-y-auto p-3", collapsed && "px-2")}
        aria-label="Store navigation"
      >
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === pathname ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          const itemClasses = cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            collapsed && "justify-center px-2",
            isActive
              ? "bg-gb-mo-step-active-bg text-gb-mo-gray-900 shadow-sm"
              : "text-gb-mo-gray-600 hover:bg-white/80 hover:text-gb-mo-gray-900",
            !item.available && !isActive && "opacity-60",
          );

          const content = (
            <>
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isActive
                    ? "bg-gb-mo-step-active-badge text-white"
                    : "bg-white text-gb-secondary group-hover:bg-gb-onboard-feature-emerald",
                )}
              >
                <Icon className="size-[18px]" aria-hidden />
              </span>
              {!collapsed && (
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <span>{item.label}</span>
                  {!item.available && (
                    <span className="text-[10px] font-normal uppercase tracking-wide text-gb-mo-gray-400">
                      Soon
                    </span>
                  )}
                </span>
              )}
            </>
          );

          if (!item.available) {
            return (
              <span
                key={item.id}
                className={cn(itemClasses, "cursor-default")}
                title={collapsed ? item.label : undefined}
              >
                {content}
              </span>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              className={itemClasses}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="shrink-0 border-t border-gb-mo-address-border p-4">
          <div className="rounded-xl border border-gb-mo-address-border bg-gradient-to-br from-gb-onboard-feature-emerald to-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gb-secondary">
              Store pulse
            </p>
            <p className="mt-1 text-sm font-medium text-gb-mo-gray-900">
              12 orders in the last hour
            </p>
            <p className="mt-0.5 text-xs text-gb-mo-gray-500">
              Demo metrics until live API sync
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

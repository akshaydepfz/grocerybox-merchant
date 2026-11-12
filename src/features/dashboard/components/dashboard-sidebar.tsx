"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppLogoImage } from "@/components/branding/app-logo";
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
    <div className={cn("flex h-full flex-col bg-card", className)}>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "gap-2.5 px-4",
        )}
      >
        <AppLogoImage size={collapsed ? 28 : 32} />
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground">
            Merchant
          </span>
        )}
      </div>

      <nav
        className={cn("flex-1 space-y-0.5 overflow-y-auto p-2", collapsed && "px-1.5")}
        aria-label="Main"
      >
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === pathname ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;

          const itemClasses = cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
            collapsed && "justify-center px-2",
            isActive
              ? "bg-muted font-medium text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            !item.available && !isActive && "opacity-50",
          );

          const content = (
            <>
              <Icon className="size-4 shrink-0" aria-hidden />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
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
    </div>
  );
}

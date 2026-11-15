"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardRoutePrefix } from "@/config/routes";
import { cn } from "@/lib/utils";

import {
  DASHBOARD_BOTTOM_NAV_ITEMS,
  DASHBOARD_MORE_NAV_ITEM,
  isDashboardNavActive,
} from "../constants/nav-items";

type DashboardBottomNavProps = {
  menuOpen: boolean;
  onOpenMenu: () => void;
};

export function DashboardBottomNav({ menuOpen, onOpenMenu }: DashboardBottomNavProps) {
  const pathname = usePathname();
  const MoreIcon = DASHBOARD_MORE_NAV_ITEM.icon;

  const onPrimaryTab = DASHBOARD_BOTTOM_NAV_ITEMS.some(
    (item) => item.available && isDashboardNavActive(pathname, item),
  );
  const moreRoutesActive =
    !onPrimaryTab &&
    (pathname === dashboardRoutePrefix ||
      pathname.startsWith(`${dashboardRoutePrefix}/`));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8eaef] bg-white/95 shadow-[0_-4px_24px_rgb(0_0_0_/0.06)] backdrop-blur-md lg:hidden"
      aria-label="Primary"
      style={{
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <ul className="mx-auto grid h-14 max-w-lg grid-cols-5 items-stretch px-1">
        {DASHBOARD_BOTTOM_NAV_ITEMS.filter((item) => item.available).map((item) => {
          const isActive = isDashboardNavActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex min-w-0">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-semibold transition-colors active:scale-[0.97]",
                  isActive ? "text-[#16a34a]" : "text-[#6b7280] hover:text-[#1a1f2e]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn("size-[22px] shrink-0", isActive && "stroke-[2.25px]")}
                  aria-hidden
                />
                <span className="max-w-full truncate leading-none">
                  {item.shortLabel ?? item.label}
                </span>
              </Link>
            </li>
          );
        })}

        <li className="flex min-w-0">
          <button
            type="button"
            onClick={onOpenMenu}
            className={cn(
              "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-semibold transition-colors active:scale-[0.97]",
              menuOpen || moreRoutesActive
                ? "text-[#16a34a]"
                : "text-[#6b7280] hover:text-[#1a1f2e]",
            )}
            aria-expanded={menuOpen}
            aria-controls="dashboard-mobile-nav"
          >
            <MoreIcon
              className={cn(
                "size-[22px] shrink-0",
                (menuOpen || moreRoutesActive) && "stroke-[2.25px]",
              )}
              aria-hidden
            />
            <span className="leading-none">{DASHBOARD_MORE_NAV_ITEM.label}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
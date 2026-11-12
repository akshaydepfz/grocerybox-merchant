"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardShellProps = {
  children: ReactNode;
  title?: string;
};

export function DashboardShell({ children, title }: DashboardShellProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const session = useAuthStore((s) => s.session);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const showMobileNav = mobileOpen && !isDesktop;

  useEffect(() => {
    if (!showMobileNav) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [showMobileNav, closeMobile]);

  const displayTitle = title ?? "Store overview";
  const email = session?.email ?? "Merchant";

  return (
    <div className="flex min-h-screen bg-gb-bg-secondary">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-gb-border bg-gb-mo-sidebar transition-[width] duration-300 ease-out lg:block",
          collapsed ? "w-[72px]" : "w-72",
        )}
      >
        <DashboardSidebar collapsed={collapsed} />
      </aside>

      {/* Mobile slide-over menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          showMobileNav ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!showMobileNav}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-gb-mo-gray-900/40 backdrop-blur-[2px] transition-opacity duration-300",
            showMobileNav ? "opacity-100" : "opacity-0",
          )}
          onClick={closeMobile}
          tabIndex={showMobileNav ? 0 : -1}
          aria-label="Close menu"
        />
        <div
          id="dashboard-mobile-nav"
          className={cn(
            "absolute inset-y-0 left-0 w-[min(100%,20rem)] border-r border-gb-border shadow-2xl transition-transform duration-300 ease-out",
            showMobileNav ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="relative h-full">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-3 z-10 text-gb-mo-gray-600"
              onClick={closeMobile}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </Button>
            <DashboardSidebar onNavigate={closeMobile} />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-gb-border bg-white/90 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-expanded={showMobileNav}
              aria-controls="dashboard-mobile-nav"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden text-gb-mo-gray-600 lg:inline-flex"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-5" />
              ) : (
                <PanelLeftClose className="size-5" />
              )}
            </Button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold tracking-tight text-gb-mo-gray-900">
                {displayTitle}
              </h1>
              <p className="hidden text-xs text-gb-mo-gray-500 sm:block">
                Fresh inventory, orders, and growth at a glance
              </p>
            </div>

            <div className="relative hidden max-w-xs flex-1 md:flex">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gb-mo-gray-400" />
              <input
                type="search"
                placeholder="Search orders, SKUs…"
                className="h-10 w-full rounded-xl border border-gb-mo-input-border bg-gb-mo-gray-100/80 pl-10 pr-4 text-sm outline-none transition focus:border-gb-mo-focus-ring focus:bg-white focus:ring-2 focus:ring-gb-mo-focus-ring/25"
                disabled
                aria-label="Search (coming soon)"
              />
            </div>

            <div
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gb-secondary to-gb-primary text-sm font-semibold text-white sm:flex"
              title={email}
            >
              {email.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

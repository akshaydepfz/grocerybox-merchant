"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
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

  const displayTitle = title ?? "Overview";
  const email = session?.email ?? "merchant@grocery.in";

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 ease-out lg:block",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <DashboardSidebar collapsed={collapsed} />
      </aside>

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
            "absolute inset-0 bg-foreground/20 transition-opacity duration-200",
            showMobileNav ? "opacity-100" : "opacity-0",
          )}
          onClick={closeMobile}
          tabIndex={showMobileNav ? 0 : -1}
          aria-label="Close menu"
        />
        <div
          id="dashboard-mobile-nav"
          className={cn(
            "absolute inset-y-0 left-0 w-60 border-r border-border bg-card shadow-lg transition-transform duration-200 ease-out",
            showMobileNav ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="relative h-full">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-2.5 z-10"
              onClick={closeMobile}
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </Button>
            <DashboardSidebar onNavigate={closeMobile} />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
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
            size="icon-sm"
            className="hidden lg:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>

          <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {displayTitle}
          </h1>

          <p className="hidden max-w-[200px] truncate text-xs text-muted-foreground sm:block">
            {email}
          </p>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

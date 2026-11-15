"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { DashboardBottomNav } from "./dashboard-bottom-nav";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);

  const showMobileNav = mobileOpen && !isDesktop;

  useEffect(() => {
    if (isDesktop) {
      setMobileOpen(false);
    }
  }, [isDesktop]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <aside className="hidden shrink-0 lg:block">
        <DashboardSidebar className="sticky top-0 h-screen" />
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
            "absolute inset-0 bg-black/45 transition-opacity duration-200",
            showMobileNav ? "opacity-100" : "opacity-0",
          )}
          onClick={closeMobile}
          tabIndex={showMobileNav ? 0 : -1}
          aria-label="Close menu"
        />
        <div
          id="dashboard-mobile-nav"
          className={cn(
            "absolute inset-y-0 right-0 w-[min(100%,20rem)] shadow-2xl transition-transform duration-200 ease-out",
            showMobileNav ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="relative h-full">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-3 z-10 text-white hover:bg-white/10"
              onClick={closeMobile}
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </Button>
            <DashboardSidebar onNavigate={closeMobile} className="h-full" />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <main
          className={cn(
            "flex-1",
            "px-3 pt-3 sm:px-4 sm:pt-4 lg:p-6",
            "pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-6",
          )}
        >
          {children}
        </main>

        <DashboardBottomNav menuOpen={mobileOpen} onOpenMenu={openMobile} />
      </div>
    </div>
  );
}
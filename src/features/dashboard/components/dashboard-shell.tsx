"use client";

import type { ReactNode } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { DashboardBottomNav } from "./dashboard-bottom-nav";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <aside className="hidden shrink-0 lg:block">
        <DashboardSidebar className="sticky top-0 h-screen" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main
          className={cn(
            "flex-1",
            "px-3 pt-3 sm:px-4 sm:pt-4 lg:p-6",
            !isDesktop && "pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))]",
            isDesktop && "pb-6",
          )}
        >
          {children}
        </main>

        <DashboardBottomNav />
      </div>
    </div>
  );
}
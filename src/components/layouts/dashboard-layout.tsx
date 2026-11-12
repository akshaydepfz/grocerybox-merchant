import type { ReactNode } from "react";

import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

type DashboardLayoutProps = {
  children: ReactNode;
  title?: string;
};

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return <DashboardShell title={title}>{children}</DashboardShell>;
}

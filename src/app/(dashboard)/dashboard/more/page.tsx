import type { Metadata } from "next";

import { DashboardMoreScreen } from "@/features/dashboard/components/dashboard-more-screen";

export const metadata: Metadata = {
  title: "Menu | GroceryBox Merchant",
  description: "More store tools and settings",
};

export default function DashboardMorePage() {
  return <DashboardMoreScreen />;
}
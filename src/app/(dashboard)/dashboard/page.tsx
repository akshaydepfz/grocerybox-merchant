import type { Metadata } from "next";

import { DashboardHomeScreen } from "@/features/dashboard/components/dashboard-home-screen";

export const metadata: Metadata = {
  title: "Dashboard | GroceryBox Merchant",
  description: "Store overview for GroceryBox merchants",
};

export default function DashboardPage() {
  return <DashboardHomeScreen />;
}

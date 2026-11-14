import type { Metadata } from "next";

import { CouponsScreen } from "@/features/coupons/components";

export const metadata: Metadata = {
  title: "Coupons | GroceryBox Merchant",
  description: "Create and manage discount coupons for your store",
};

export default function CouponsPage() {
  return <CouponsScreen />;
}
import type { Metadata } from "next";

import { CouponCreateScreen } from "@/features/coupons/components";

export const metadata: Metadata = {
  title: "Add coupon | GroceryBox Merchant",
  description: "Create a new discount coupon for your store",
};

export default function CouponCreatePage() {
  return <CouponCreateScreen />;
}
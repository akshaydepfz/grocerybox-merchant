import type { Metadata } from "next";

import { MerchantProfileScreen } from "@/features/profile/components";

export const metadata: Metadata = {
  title: "Profile | GroceryBox Merchant",
  description: "View and manage your merchant profile",
};

export default function MerchantProfilePage() {
  return <MerchantProfileScreen />;
}

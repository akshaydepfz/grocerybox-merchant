import type { Metadata } from "next";

import { DeliveryBoyCreateScreen } from "@/features/delivery-boys/components";

export const metadata: Metadata = {
  title: "Add Delivery Boy | GroceryBox Merchant",
  description: "Add a delivery partner and configure commission settings",
};

export default function NewDeliveryBoyPage() {
  return <DeliveryBoyCreateScreen />;
}
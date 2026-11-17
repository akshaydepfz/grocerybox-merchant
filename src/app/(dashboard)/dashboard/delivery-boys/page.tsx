import type { Metadata } from "next";

import { DeliveryBoysScreen } from "@/features/delivery-boys/components";

export const metadata: Metadata = {
  title: "Delivery Boys | GroceryBox Merchant",
  description: "Manage delivery partners and track team availability",
};

export default function DeliveryBoysPage() {
  return <DeliveryBoysScreen />;
}
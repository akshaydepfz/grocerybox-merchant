import type { Metadata } from "next";

import { OrdersScreen } from "@/features/orders/components";

export const metadata: Metadata = {
  title: "Orders | GroceryBox Merchant",
  description: "View and fulfill storefront customer orders",
};

export default function OrdersPage() {
  return <OrdersScreen />;
}

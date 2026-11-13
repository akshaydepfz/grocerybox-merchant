import type { Metadata } from "next";

import { OrderDetailScreen } from "@/features/orders/components";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export const metadata: Metadata = {
  title: "Order details | GroceryBox Merchant",
  description: "View order details and update fulfillment status",
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  return <OrderDetailScreen orderId={orderId} />;
}

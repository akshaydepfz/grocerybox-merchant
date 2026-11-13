import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingIndicator } from "@/components/shared/loading-indicator";
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
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingIndicator label="Loading order" />
        </div>
      }
    >
      <OrderDetailScreen orderId={orderId} />
    </Suspense>
  );
}

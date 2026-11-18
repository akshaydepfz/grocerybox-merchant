import type { Metadata } from "next";

import {
  DeliveryBoyEditScreen,
  DeliveryBoyPlanGate,
} from "@/features/delivery-boys/components";

export const metadata: Metadata = {
  title: "Edit Delivery Boy | GroceryBox Merchant",
  description: "Update delivery partner profile and commission",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDeliveryBoyPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <DeliveryBoyPlanGate>
      <DeliveryBoyEditScreen deliveryBoyId={id} />
    </DeliveryBoyPlanGate>
  );
}
"use client";

import { ArrowLeft, Truck } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { dashboardRoutePrefix } from "@/config/routes";

import { DeliveryBoyForm } from "./delivery-boy-form";

const listHref = `${dashboardRoutePrefix}/delivery-boys`;

export function DeliveryBoyCreateScreen() {
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <p className="text-sm text-[#6b7280]">Sign in to add delivery partners.</p>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage className="mx-auto max-w-3xl">
      <Link
        href={listHref}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#6b7280] transition hover:text-[#16a34a]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Delivery Boys
      </Link>

      <header className="mt-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#0d9488] text-white shadow-md shadow-[#16a34a]/20">
            <Truck className="size-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
              Add Delivery Boy
            </h1>
            <p className="mt-0.5 text-sm text-[#6b7280]">
              Add a delivery partner to your store and configure their commission.
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6">
        <DeliveryBoyForm mode="create" />
      </div>
    </DashboardPage>
  );
}
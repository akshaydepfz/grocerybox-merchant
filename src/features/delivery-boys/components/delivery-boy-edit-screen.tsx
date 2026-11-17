"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Truck } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { dashboardRoutePrefix } from "@/config/routes";
import { ApiError } from "@/lib/api/types";

import {
  friendlyDeliveryBoyError,
  getMerchantDeliveryBoy,
} from "../services";

import { DeliveryBoyForm } from "./delivery-boy-form";

const listHref = `${dashboardRoutePrefix}/delivery-boys`;

type DeliveryBoyEditScreenProps = {
  deliveryBoyId: string;
};

export function DeliveryBoyEditScreen({
  deliveryBoyId,
}: DeliveryBoyEditScreenProps) {
  const { user, isRegistered } = useAuth();

  const detailQuery = useQuery({
    queryKey: ["merchant-delivery-boy", deliveryBoyId],
    queryFn: () => getMerchantDeliveryBoy(deliveryBoyId),
    enabled: Boolean(user && isRegistered && deliveryBoyId),
    refetchOnWindowFocus: false,
  });

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <p className="text-sm text-[#6b7280]">Sign in to edit delivery partners.</p>
      </DashboardPage>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading delivery partner"
          sublabel="Fetching profile"
        />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    const message =
      detailQuery.error instanceof ApiError
        ? friendlyDeliveryBoyError(detailQuery.error)
        : "Unable to load delivery partner.";
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Could not load delivery partner"
          message={message}
          onRetry={() => void detailQuery.refetch()}
        />
      </DashboardPage>
    );
  }

  const partner = detailQuery.data;

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
              Edit Delivery Boy
            </h1>
            <p className="mt-0.5 text-sm text-[#6b7280]">
              Update {partner.fullName}&apos;s profile and commission settings.
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6">
        <DeliveryBoyForm mode="edit" partner={partner} />
      </div>
    </DashboardPage>
  );
}
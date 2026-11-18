"use client";

import { useMerchantProfileQuery } from "./use-merchant-profile";
import { merchantHasDeliveryBoyManagement } from "../utils/subscription-plan-features";

export function useDeliveryBoyManagementEnabled(): boolean {
  const profileQuery = useMerchantProfileQuery();
  return merchantHasDeliveryBoyManagement(profileQuery.data?.subscription);
}

export function useDeliveryBoyManagementResolved(): {
  enabled: boolean;
  isLoading: boolean;
} {
  const profileQuery = useMerchantProfileQuery();
  return {
    enabled: merchantHasDeliveryBoyManagement(profileQuery.data?.subscription),
    isLoading: profileQuery.isLoading,
  };
}
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuth } from "@/features/auth/components/auth-provider";
import { ApiError } from "@/lib/api/types";

import {
  activateMerchantCoupon,
  createMerchantCoupon,
  deactivateMerchantCoupon,
  deleteMerchantCoupon,
  friendlyCouponError,
  listMerchantCoupons,
} from "../services/coupon-service";
import type { MerchantCoupon, MerchantCouponDraft } from "../types/merchant-coupon";

export const MERCHANT_COUPONS_QUERY_KEY = ["merchant-coupons"] as const;

export function useMerchantCoupons() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const listQuery = useQuery({
    queryKey: MERCHANT_COUPONS_QUERY_KEY,
    queryFn: () => listMerchantCoupons({ limit: 100 }),
    enabled: Boolean(user),
  });

  const coupons = listQuery.data?.items ?? [];
  const hydrated = listQuery.isFetched;
  const loading = listQuery.isLoading;
  const error =
    listQuery.error instanceof ApiError
      ? friendlyCouponError(listQuery.error)
      : listQuery.error
        ? "Unable to load coupons."
        : null;

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: MERCHANT_COUPONS_QUERY_KEY });
  }, [queryClient]);

  const addCoupon = useCallback(
    async (draft: MerchantCouponDraft): Promise<MerchantCoupon> => {
      const created = await createMerchantCoupon(draft);
      await invalidate();
      return created;
    },
    [invalidate],
  );

  const removeCoupon = useCallback(
    async (couponId: string) => {
      await deleteMerchantCoupon(couponId);
      await invalidate();
    },
    [invalidate],
  );

  const toggleCouponActive = useCallback(
    async (couponId: string, isActive: boolean) => {
      if (isActive) {
        await activateMerchantCoupon(couponId);
      } else {
        await deactivateMerchantCoupon(couponId);
      }
      await invalidate();
    },
    [invalidate],
  );

  return {
    coupons,
    hydrated,
    loading,
    error,
    refetch: listQuery.refetch,
    addCoupon,
    removeCoupon,
    toggleCouponActive,
  };
}
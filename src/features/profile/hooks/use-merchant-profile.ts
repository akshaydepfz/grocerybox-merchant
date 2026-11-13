"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api/types";

import {
  getMerchantProfile,
  registerOrRetrieveMerchantProfile,
  updateMerchantAccountName,
} from "../services";
import type { MerchantProfile } from "../types";

export const MERCHANT_PROFILE_QUERY_KEY = ["merchant-profile"] as const;

export function useMerchantProfileQuery(): UseQueryResult<MerchantProfile, Error> {
  return useQuery({
    queryKey: MERCHANT_PROFILE_QUERY_KEY,
    queryFn: registerOrRetrieveMerchantProfile,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useMerchantProfileRefresh() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: MERCHANT_PROFILE_QUERY_KEY });
    return queryClient.fetchQuery({
      queryKey: MERCHANT_PROFILE_QUERY_KEY,
      queryFn: getMerchantProfile,
    });
  };
}

export function useUpdateMerchantAccountNameMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMerchantAccountName,
    onSuccess: async (profile) => {
      queryClient.setQueryData(MERCHANT_PROFILE_QUERY_KEY, profile);
    },
  });
}

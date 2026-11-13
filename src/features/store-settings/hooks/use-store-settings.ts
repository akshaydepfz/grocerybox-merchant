"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/types";

import { fetchStoreSettings, patchStoreSettings } from "../services";
import type { StoreSettingsPatchBody } from "../types/store-settings";

export const STORE_SETTINGS_QUERY_KEY = ["merchant-store-settings"] as const;

export function useStoreSettingsQuery() {
  return useQuery({
    queryKey: STORE_SETTINGS_QUERY_KEY,
    queryFn: fetchStoreSettings,
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function usePatchStoreSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: StoreSettingsPatchBody) => patchStoreSettings(body),
    onSuccess: (data) => {
      queryClient.setQueryData(STORE_SETTINGS_QUERY_KEY, data);
    },
  });
}

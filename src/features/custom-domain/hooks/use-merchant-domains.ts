"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

import { useAuth } from "@/features/auth/components/auth-provider";
import { ApiError } from "@/lib/api/types";

import {
  createMerchantDomain,
  deleteMerchantDomain,
  friendlyDomainError,
  friendlyDomainVerifyError,
  getMerchantDomain,
  listMerchantDomains,
  verifyMerchantDomain,
} from "../services/domain-service";
import type {
  MerchantDomain,
  MerchantDomainCreateInput,
} from "../types/merchant-domain";

export const MERCHANT_DOMAINS_QUERY_KEY = ["merchant-domains"] as const;

export function merchantDomainDetailQueryKey(id: string) {
  return ["merchant-domain", id] as const;
}

export function useMerchantDomains() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const verifyInFlightRef = useRef<Set<string>>(new Set());

  const listQuery = useQuery({
    queryKey: MERCHANT_DOMAINS_QUERY_KEY,
    queryFn: listMerchantDomains,
    enabled: Boolean(user),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const domains = listQuery.data ?? [];
  const hydrated = listQuery.isFetched;
  const loading = listQuery.isLoading;
  const error =
    listQuery.error instanceof ApiError
      ? friendlyDomainError(listQuery.error)
      : listQuery.error
        ? "Unable to load domains."
        : null;

  const invalidateList = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: MERCHANT_DOMAINS_QUERY_KEY });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (input: MerchantDomainCreateInput) => createMerchantDomain(input),
    onSuccess: async (created) => {
      await invalidateList();
      await queryClient.setQueryData(
        merchantDomainDetailQueryKey(created.id),
        created,
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteMerchantDomain(id),
    onSuccess: async () => {
      await invalidateList();
    },
  });

  const addDomain = useCallback(
    async (input: MerchantDomainCreateInput): Promise<MerchantDomain> => {
      return createMutation.mutateAsync(input);
    },
    [createMutation],
  );

  const removeDomain = useCallback(
    async (id: string) => {
      await removeMutation.mutateAsync(id);
    },
    [removeMutation],
  );

  const verifyDomain = useCallback(
    async (id: string): Promise<MerchantDomain> => {
      if (verifyInFlightRef.current.has(id)) {
        throw new ApiError("Verification already in progress.", 0);
      }
      verifyInFlightRef.current.add(id);
      try {
        const verified = await verifyMerchantDomain(id);
        await invalidateList();
        await queryClient.setQueryData(merchantDomainDetailQueryKey(id), verified);
        return verified;
      } finally {
        verifyInFlightRef.current.delete(id);
      }
    },
    [invalidateList, queryClient],
  );

  const verifyErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      return friendlyDomainVerifyError(error);
    }
    return "Unable to verify domain.";
  };

  return {
    domains,
    hydrated,
    loading,
    error,
    refetch: listQuery.refetch,
    addDomain,
    removeDomain,
    verifyDomain,
    verifyErrorMessage,
    isCreating: createMutation.isPending,
    isRemoving: removeMutation.isPending,
    createError:
      createMutation.error instanceof ApiError
        ? friendlyDomainError(createMutation.error)
        : null,
  };
}

export function useMerchantDomainDetail(domainId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: domainId ? merchantDomainDetailQueryKey(domainId) : ["merchant-domain", "none"],
    queryFn: () => getMerchantDomain(domainId!),
    enabled: Boolean(user && domainId),
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Search, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { dashboardRoutePrefix } from "@/config/routes";
import { ApiError } from "@/lib/api/types";

import {
  friendlyDeliveryBoyError,
  getMerchantDeliveryBoySummary,
  listMerchantDeliveryBoys,
} from "../services";
import type { DeliveryBoyStatusFilter } from "../types/delivery-boy";

import { DeliveryBoySummaryCards } from "./delivery-boy-summary-cards";
import { DeliveryBoysTable } from "./delivery-boys-table";

export function DeliveryBoysScreen() {
  const { user, isRegistered } = useAuth();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<DeliveryBoyStatusFilter>("all");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchDraft.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchDraft]);

  const listEnabled = Boolean(user && isRegistered);
  const hasActiveFilters = search.length > 0 || statusFilter !== "all";

  const summaryQuery = useQuery({
    queryKey: ["merchant-delivery-boys-summary"],
    queryFn: getMerchantDeliveryBoySummary,
    enabled: listEnabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const listQuery = useQuery({
    queryKey: ["merchant-delivery-boys", search, statusFilter],
    queryFn: () =>
      listMerchantDeliveryBoys({
        page: 1,
        limit: 100,
        search: search || undefined,
        status: statusFilter,
      }),
    enabled: listEnabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (listQuery.error) {
      toast.error(
        listQuery.error instanceof ApiError
          ? friendlyDeliveryBoyError(listQuery.error)
          : "Unable to load delivery boys.",
      );
    }
  }, [listQuery.error]);

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <p className="text-sm text-[#6b7280]">Sign in to manage delivery boys.</p>
      </DashboardPage>
    );
  }

  const initialLoading = listQuery.isLoading && !listQuery.data;
  const listFailed = listQuery.isError && !listQuery.data;

  if (initialLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading delivery boys"
          sublabel="Fetching delivery team"
        />
      </div>
    );
  }

  if (listFailed) {
    const message =
      listQuery.error instanceof ApiError
        ? friendlyDeliveryBoyError(listQuery.error)
        : "Unable to load delivery boys.";
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Could not load delivery boys"
          message={message}
          onRetry={() => {
            void listQuery.refetch();
            void summaryQuery.refetch();
          }}
        />
      </DashboardPage>
    );
  }

  const items = listQuery.data?.items ?? [];

  return (
    <DashboardPage>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
            Delivery Boys
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Manage your delivery team and track their availability.
          </p>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 rounded-xl bg-[#16a34a] px-4 text-sm font-semibold text-white hover:bg-[#15803d]"
          asChild
        >
          <Link href={`${dashboardRoutePrefix}/delivery-boys/new`}>
            <Plus className="size-4" aria-hidden />
            Add Delivery Boy
          </Link>
        </Button>
      </header>

      <DeliveryBoySummaryCards
        summary={summaryQuery.data ?? null}
        loading={summaryQuery.isLoading}
      />

      <DashboardSurface>
        <div className="flex flex-col gap-4 border-b border-[#f0f1f4] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1a1f2e]">
                Delivery team
              </h2>
              <p className="mt-0.5 text-xs text-[#9ca3af]">
                Search by name or phone number.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:max-w-xl sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Search by name or phone…"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] pl-10 pr-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as DeliveryBoyStatusFilter)
                }
                className="h-10 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
                aria-label="Filter by status"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 text-[#6b7280] hover:text-[#16a34a]"
                onClick={() => {
                  setSearchDraft("");
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : null}
        </div>

        {listQuery.isFetching && !listQuery.isLoading ? (
          <div className="flex items-center gap-2 border-b border-[#f0f1f4] px-5 py-2 text-xs text-[#6b7280]">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Refreshing…
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <Truck className="size-10 text-[#d1d5db]" aria-hidden />
            <p className="text-sm font-semibold text-[#1a1f2e]">
              {hasActiveFilters
                ? "No delivery partners match your filters"
                : "No delivery partners yet"}
            </p>
            <p className="max-w-sm text-sm text-[#6b7280]">
              {hasActiveFilters
                ? "Try adjusting search or status filters."
                : "Add a delivery partner to start building your team."}
            </p>
          </div>
        ) : (
          <DeliveryBoysTable items={items} />
        )}
      </DashboardSurface>
    </DashboardPage>
  );
}
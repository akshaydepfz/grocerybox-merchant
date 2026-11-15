"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { formatCustomerPhone, formatInr } from "@/features/orders/utils/format-order";
import { dashboardRoutePrefix } from "@/config/routes";
import { ApiError } from "@/lib/api/types";

import { friendlyCustomerError, listMerchantCustomers } from "../services";
import type { MerchantCustomerListItem } from "../types/merchant-customer";
import { customerDisplayLabel, formatCustomerDateTime } from "../utils/format-customer";

export function CustomersScreen() {
  const { user, isRegistered } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchDraft.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchDraft]);

  const hasActiveFilters = search.length > 0;
  const listEnabled = Boolean(user && isRegistered);
  const filters = { page, limit, search: search || undefined };

  const listQuery = useQuery({
    queryKey: ["merchant-customers", filters],
    queryFn: () => listMerchantCustomers(filters),
    enabled: listEnabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (listQuery.error) {
      toast.error(
        listQuery.error instanceof ApiError
          ? friendlyCustomerError(listQuery.error)
          : "Unable to load customers.",
      );
    }
  }, [listQuery.error]);

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Sign in required"
          message="Sign in to view storefront customers."
        />
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
          label="Loading customers"
          sublabel="Fetching storefront contacts"
        />
      </div>
    );
  }

  if (listFailed) {
    const message =
      listQuery.error instanceof ApiError
        ? friendlyCustomerError(listQuery.error)
        : "Unable to load customers.";
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Could not load customers"
          message={message}
          onRetry={() => void listQuery.refetch()}
        />
      </DashboardPage>
    );
  }

  const items = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;
  const totalCustomers = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;

  const emptyMessage = hasActiveFilters
    ? "Try a different name or phone number."
    : "Customers appear when someone saves a delivery address or places an order on your storefront.";

  return (
    <DashboardPage>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
            Customers
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Storefront shoppers identified by mobile number — no separate customer
            login.
          </p>
          <p className="mt-2 text-xs font-medium text-[#9ca3af]">
            {totalCustomers.toLocaleString("en-IN")} contacts total
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0 rounded-xl border-[#e8eaef]"
          disabled={listQuery.isFetching}
          onClick={() => void listQuery.refetch()}
        >
          <RotateCcw className="size-4" aria-hidden />
          <span className="ml-2">Refresh</span>
        </Button>
      </header>

      <DashboardSurface>
        <div className="flex flex-col gap-4 border-b border-[#f0f1f4] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#1a1f2e]">All customers</h2>
              <p className="mt-0.5 text-xs text-[#9ca3af]">
                Search by customer name or phone.
              </p>
            </div>
            <div className="relative w-full lg:max-w-xl">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search customers…"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] pl-10 pr-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
                Per page
              </span>
              <select
                value={String(limit)}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                className="h-10 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              >
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </label>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 text-[#6b7280] hover:text-[#16a34a]"
                onClick={() => {
                  setSearchDraft("");
                  setSearch("");
                  setPage(1);
                }}
              >
                Reset search
              </Button>
            ) : null}
          </div>
        </div>

        {listQuery.isFetching && !listQuery.isLoading ? (
          <div className="flex items-center gap-2 border-b border-[#f0f1f4] px-5 py-2 text-xs text-[#6b7280]">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Refreshing…
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <Users className="size-10 text-[#d1d5db]" aria-hidden />
            <p className="text-sm font-semibold text-[#1a1f2e]">
              {hasActiveFilters ? "No customers match your search" : "No customers yet"}
            </p>
            <p className="max-w-sm text-sm text-[#6b7280]">{emptyMessage}</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#f0f1f4] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    <th className="px-5 py-3 font-semibold" scope="col">
                      Customer
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Phone
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Orders
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Saved addresses
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Last order
                    </th>
                    <th className="px-3 py-3 text-right font-semibold" scope="col">
                      Lifetime spend
                    </th>
                    <th className="px-5 py-3 text-right font-semibold" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f1f4]">
                  {items.map((customer) => (
                    <CustomerTableRow key={customer.phone} customer={customer} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 p-4 md:hidden">
              {items.map((customer) => (
                <CustomerMobileCard key={customer.phone} customer={customer} />
              ))}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#f0f1f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#6b7280]">
                Page {currentPage} of {Math.max(totalPages, 1)} ·{" "}
                {totalCustomers.toLocaleString("en-IN")} customers
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl"
                  disabled={currentPage <= 1 || listQuery.isFetching}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl"
                  disabled={currentPage >= totalPages || listQuery.isFetching}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          </>
        )}
      </DashboardSurface>
    </DashboardPage>
  );
}

function ordersHrefForPhone(phone: string): string {
  const params = new URLSearchParams({ search: phone });
  return `${dashboardRoutePrefix}/orders?${params.toString()}`;
}

function CustomerTableRow({ customer }: { customer: MerchantCustomerListItem }) {
  const ordersHref = useMemo(() => ordersHrefForPhone(customer.phone), [customer.phone]);
  const label = customerDisplayLabel(customer.displayName, customer.phone);

  return (
    <tr className="transition hover:bg-[#fafbfc]">
      <td className="px-5 py-4">
        <p className="font-semibold text-[#1a1f2e]">{label}</p>
        {customer.orderCount === 0 ? (
          <p className="mt-0.5 text-xs text-[#9ca3af]">Address only — no orders yet</p>
        ) : null}
      </td>
      <td className="px-3 py-4 text-[#6b7280]">
        {formatCustomerPhone(customer.phone)}
      </td>
      <td className="px-3 py-4 tabular-nums text-[#1a1f2e]">{customer.orderCount}</td>
      <td className="px-3 py-4 tabular-nums text-[#6b7280]">
        {customer.savedAddressCount}
      </td>
      <td className="px-3 py-4 text-[#6b7280]">
        {formatCustomerDateTime(customer.lastOrderAt)}
      </td>
      <td className="px-3 py-4 text-right tabular-nums font-semibold text-[#1a1f2e]">
        {customer.orderCount > 0 ? formatInr(customer.lifetimeSpend) : "—"}
      </td>
      <td className="px-5 py-4 text-right">
        {customer.orderCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-[#eceef2] px-3"
            asChild
          >
            <Link href={ordersHref}>
              <ShoppingCart className="size-3.5" aria-hidden />
              <span className="ml-1.5">Orders</span>
            </Link>
          </Button>
        ) : (
          <span className="text-xs text-[#9ca3af]">—</span>
        )}
      </td>
    </tr>
  );
}

function CustomerMobileCard({ customer }: { customer: MerchantCustomerListItem }) {
  const ordersHref = useMemo(() => ordersHrefForPhone(customer.phone), [customer.phone]);
  const label = customerDisplayLabel(customer.displayName, customer.phone);

  return (
    <article className="rounded-2xl border border-[#f0f1f4] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[#1a1f2e]">{label}</p>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            {formatCustomerPhone(customer.phone)}
          </p>
        </div>
        {customer.orderCount > 0 ? (
          <p className="text-base font-bold tabular-nums text-[#1a1f2e]">
            {formatInr(customer.lifetimeSpend)}
          </p>
        ) : null}
      </div>
      <CustomerStats customer={customer} />
      {customer.orderCount > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 h-9 w-full rounded-xl"
          asChild
        >
          <Link href={ordersHref}>View orders</Link>
        </Button>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-[#9ca3af]">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          Saved address — awaiting first order
        </p>
      )}
    </article>
  );
}

function CustomerStats({ customer }: { customer: MerchantCustomerListItem }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6b7280]">
      <span>
        {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"}
      </span>
      <span>
        {customer.savedAddressCount} saved address
        {customer.savedAddressCount === 1 ? "" : "es"}
      </span>
      {customer.lastOrderAt ? (
        <span>Last order {formatCustomerDateTime(customer.lastOrderAt)}</span>
      ) : null}
    </div>
  );
}
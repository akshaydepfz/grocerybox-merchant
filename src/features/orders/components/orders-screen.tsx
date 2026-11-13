"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RotateCcw,
  Search,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { dashboardRoutePrefix } from "@/config/routes";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import { friendlyOrderError, listMerchantOrders } from "../services";
import type {
  MerchantOrderListItem,
  MerchantOrderPaymentStatus,
  MerchantOrderTimelineStep,
} from "../types/merchant-order";
import {
  formatCustomerPhone,
  formatInr,
  formatOrderDateTime,
  orderStepLabel,
} from "../utils/format-order";

import { OrderPaymentBadge } from "./order-payment-badge";
import { OrderStepBadge } from "./order-step-badge";

const STEP_OPTIONS: { value: "" | MerchantOrderTimelineStep; label: string }[] = [
  { value: "", label: "All fulfillment statuses" },
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packing", label: "Packing" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_OPTIONS: { value: "" | MerchantOrderPaymentStatus; label: string }[] = [
  { value: "", label: "All payment statuses" },
  { value: "cod_pending", label: "COD pending" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export function OrdersScreen() {
  const { user, isRegistered } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [currentStep, setCurrentStep] = useState<"" | MerchantOrderTimelineStep>("");
  const [paymentStatus, setPaymentStatus] = useState<"" | MerchantOrderPaymentStatus>("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchDraft.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchDraft]);

  const hasActiveFilters = useMemo(
    () =>
      search.length > 0 ||
      currentStep.length > 0 ||
      paymentStatus.length > 0,
    [search, currentStep, paymentStatus],
  );

  const resetFilters = () => {
    setSearchDraft("");
    setSearch("");
    setCurrentStep("");
    setPaymentStatus("");
    setPage(1);
  };

  const listEnabled = Boolean(user && isRegistered);
  const filters = {
    page,
    limit,
    search: search || undefined,
    currentStep: currentStep || undefined,
    paymentStatus: paymentStatus || undefined,
  };

  const listQuery = useQuery({
    queryKey: ["merchant-orders", filters],
    queryFn: () => listMerchantOrders(filters),
    enabled: listEnabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (listQuery.error) {
      toast.error(
        listQuery.error instanceof ApiError
          ? friendlyOrderError(listQuery.error)
          : "Unable to load orders.",
      );
    }
  }, [listQuery.error]);

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Sign in required"
          message="Sign in to view and fulfill storefront orders."
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
          label="Loading orders"
          sublabel="Fetching storefront orders"
        />
      </div>
    );
  }

  if (listFailed) {
    const message =
      listQuery.error instanceof ApiError
        ? friendlyOrderError(listQuery.error)
        : "Unable to load orders.";
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Could not load orders"
          message={message}
          onRetry={() => void listQuery.refetch()}
        />
      </DashboardPage>
    );
  }

  const items = listQuery.data?.items ?? [];
  const pagination = listQuery.data?.pagination;
  const totalOrders = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? page;

  const emptyMessage = hasActiveFilters
    ? "Try adjusting your search or filters."
    : "Orders placed on your website checkout will appear here.";

  return (
    <DashboardPage>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
            Orders
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            View storefront orders and update fulfillment status for customer
            tracking.
          </p>
          <p className="mt-2 text-xs font-medium text-[#9ca3af]">
            {totalOrders.toLocaleString("en-IN")} orders total
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
              <h2 className="text-base font-semibold text-[#1a1f2e]">
                All orders
              </h2>
              <p className="mt-0.5 text-xs text-[#9ca3af]">
                Search by order number or customer phone.
              </p>
            </div>
            <div className="relative w-full lg:max-w-xl">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
                aria-hidden
              />
              <OrderSearchInput
                key={search}
                initialValue={searchDraft}
                onValueChange={setSearchDraft}
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <FilterSelect
              label="Fulfillment"
              value={currentStep}
              onChange={(value) => {
                setCurrentStep(value as "" | MerchantOrderTimelineStep);
                setPage(1);
              }}
            >
              {STEP_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Payment"
              value={paymentStatus}
              onChange={(value) => {
                setPaymentStatus(value as "" | MerchantOrderPaymentStatus);
                setPage(1);
              }}
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Per page"
              value={String(limit)}
              onChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </FilterSelect>
          </div>

          {hasActiveFilters ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 text-[#6b7280] hover:text-[#16a34a]"
                onClick={resetFilters}
              >
                Reset filters
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
            <ShoppingCart className="size-10 text-[#d1d5db]" aria-hidden />
            <p className="text-sm font-semibold text-[#1a1f2e]">
              {hasActiveFilters ? "No orders match your filters" : "No orders yet"}
            </p>
            <p className="max-w-sm text-sm text-[#6b7280]">{emptyMessage}</p>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={resetFilters}
              >
                Reset filters
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#f0f1f4] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    <th className="px-5 py-3 font-semibold" scope="col">
                      Order
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Customer
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Placed
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Fulfillment
                    </th>
                    <th className="px-3 py-3 font-semibold" scope="col">
                      Payment
                    </th>
                    <th className="px-3 py-3 text-right font-semibold" scope="col">
                      Total
                    </th>
                    <th className="px-5 py-3 text-right font-semibold" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f1f4]">
                  {items.map((order) => (
                    <OrderTableRow key={order.id} order={order} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 p-4 md:hidden">
              {items.map((order) => (
                <OrderMobileCard key={order.id} order={order} />
              ))}
            </div>
          </>
        )}

        {totalPages > 1 || limit !== 20 ? (
          <div className="flex flex-col gap-3 border-t border-[#f0f1f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#6b7280]">
              Page {currentPage} of {totalPages} ·{" "}
              {totalOrders.toLocaleString("en-IN")} orders
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1 || listQuery.isFetching}
                onClick={() => setPage(Math.max(1, currentPage - 1))}
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || listQuery.isFetching}
                onClick={() => setPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}
      </DashboardSurface>
    </DashboardPage>
  );
}

function OrderSearchInput({
  initialValue,
  onValueChange,
}: {
  initialValue: string;
  onValueChange: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <input
      type="search"
      placeholder="Search orders…"
      value={value}
      onChange={(event) => {
        const next = event.target.value;
        setValue(next);
        onValueChange(next);
      }}
      className="h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] pl-10 pr-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
    />
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
  children: ReactNode;
};

function FilterSelect({
  label,
  value,
  disabled,
  className,
  onChange,
  children,
}: FilterSelectProps) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9ca3af]">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {children}
      </select>
    </label>
  );
}

function OrderTableRow({ order }: { order: MerchantOrderListItem }) {
  const detailHref = `${dashboardRoutePrefix}/orders/${order.id}`;

  return (
    <tr className="transition hover:bg-[#fafbfc]">
      <td className="px-5 py-4">
        <Link
          href={detailHref}
          className="font-semibold text-[#1a1f2e] transition hover:text-[#16a34a] hover:underline"
        >
          {order.orderNumber}
        </Link>
        <p className="mt-0.5 text-xs text-[#9ca3af]">
          {order.lineCount} item{order.lineCount === 1 ? "" : "s"} ·{" "}
          {order.fulfillmentMethod.replace(/_/g, " ")}
        </p>
      </td>
      <td className="px-3 py-4 text-[#6b7280]">
        {formatCustomerPhone(order.customerPhone)}
      </td>
      <td className="px-3 py-4 text-[#6b7280]">
        {formatOrderDateTime(order.placedAt)}
      </td>
      <td className="px-3 py-4">
        <OrderStepBadge step={order.currentStep} />
      </td>
      <td className="px-3 py-4">
        <OrderPaymentBadge status={order.paymentStatus} />
      </td>
      <td className="px-3 py-4 text-right tabular-nums font-semibold text-[#1a1f2e]">
        {formatInr(order.toPay)}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-[#eceef2] px-3"
            asChild
          >
            <Link href={detailHref}>
              <Eye className="size-3.5" aria-hidden />
              <span className="ml-1.5 hidden lg:inline">View</span>
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  );
}

function OrderMobileCard({ order }: { order: MerchantOrderListItem }) {
  const detailHref = `${dashboardRoutePrefix}/orders/${order.id}`;

  return (
    <article className="rounded-2xl border border-[#f0f1f4] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={detailHref}
            className="text-base font-semibold text-[#1a1f2e] hover:text-[#16a34a]"
          >
            {order.orderNumber}
          </Link>
          <p className="mt-0.5 text-xs text-[#9ca3af]">
            {formatOrderDateTime(order.placedAt)}
          </p>
        </div>
        <p className="text-base font-bold tabular-nums text-[#1a1f2e]">
          {formatInr(order.toPay)}
        </p>
      </div>
      <p className="mt-2 text-sm text-[#6b7280]">
        {formatCustomerPhone(order.customerPhone)}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <OrderStepBadge step={order.currentStep} />
        <OrderPaymentBadge status={order.paymentStatus} />
      </div>
      <p className="mt-2 text-xs text-[#9ca3af]">
        {orderStepLabel(order.currentStep)} · {order.deliveryLabel}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 h-9 w-full rounded-xl"
        asChild
      >
        <Link href={detailHref}>View order</Link>
      </Button>
    </article>
  );
}

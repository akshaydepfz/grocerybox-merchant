"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, Loader2, RotateCcw, Search } from "lucide-react";
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
} from "../utils/format-order";

import { OrderStepBadge } from "./order-step-badge";

const STEP_OPTIONS: { value: "" | MerchantOrderTimelineStep; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packing", label: "Packing" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
];

const PAYMENT_OPTIONS: { value: "" | MerchantOrderPaymentStatus; label: string }[] = [
  { value: "", label: "All payments" },
  { value: "cod_pending", label: "COD pending" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export function OrdersScreen() {
  const { user, isRegistered } = useAuth();
  const [page, setPage] = useState(1);
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

  const listEnabled = Boolean(user && isRegistered);
  const filters = {
    page,
    limit: 20,
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
      <DashboardPage>
        <ErrorState title="Sign in required" message="Sign in to view storefront orders." />
      </DashboardPage>
    );
  }

  const loading = listQuery.isLoading && !listQuery.data;
  const totalOrders = listQuery.data?.pagination.total ?? 0;

  return (
    <DashboardPage>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">Orders</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Website checkout orders from your storefront — update status to match
          customer tracking.
        </p>
        {!loading ? (
          <p className="mt-2 text-xs font-medium text-[#9ca3af]">
            {totalOrders.toLocaleString("en-IN")} orders total
          </p>
        ) : null}
      </header>
      <DashboardSurface className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#f0f1f4] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search order # or phone"
              className="h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] pl-10 pr-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={currentStep}
              onChange={(event) => {
                setCurrentStep(event.target.value as "" | MerchantOrderTimelineStep);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e]"
            >
              {STEP_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={paymentStatus}
              onChange={(event) => {
                setPaymentStatus(event.target.value as "" | MerchantOrderPaymentStatus);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e]"
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 rounded-xl"
              disabled={listQuery.isFetching}
              onClick={() => void listQuery.refetch()}
            >
              <RotateCcw className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center py-16">
            <GroceryAnimatedLoader theme="dashboard" label="Loading orders" />
          </div>
        ) : listQuery.isError && !listQuery.data ? (
          <OrdersListError
            message={
              listQuery.error instanceof ApiError
                ? friendlyOrderError(listQuery.error)
                : "Unable to load orders."
            }
            onRetry={() => void listQuery.refetch()}
          />
        ) : (
          <>
            {listQuery.isFetching && !listQuery.isLoading ? (
              <div className="flex items-center gap-2 border-b border-[#f0f1f4] px-5 py-2 text-xs text-[#6b7280]">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Refreshing…
              </div>
            ) : null}
            <OrdersTable
              items={listQuery.data?.items ?? []}
              page={listQuery.data?.pagination.page ?? 1}
              totalPages={listQuery.data?.pagination.totalPages ?? 0}
              onPageChange={setPage}
              isFetching={listQuery.isFetching}
            />
          </>
        )}
      </DashboardSurface>
    </DashboardPage>
  );
}

function OrdersListError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-8">
      <ErrorState title="Could not load orders" message={message} onRetry={onRetry} />
    </div>
  );
}

function OrdersTable({
  items,
  page,
  totalPages,
  onPageChange,
  isFetching,
}: {
  items: MerchantOrderListItem[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isFetching: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-sm font-semibold text-[#1a1f2e]">No orders yet</p>
        <p className="mt-1 text-sm text-[#6b7280]">
          Orders placed on your website checkout will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#f0f1f4] bg-[#fafbfc] text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Placed</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id} className="border-b border-[#f0f1f4] hover:bg-[#fafbfc]/80">
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#1a1f2e]">{order.orderNumber}</p>
                  <p className="text-xs text-[#9ca3af]">
                    {order.lineCount} line{order.lineCount === 1 ? "" : "s"}
                  </p>
                </td>
                <td className="px-5 py-4 text-[#4b5563]">
                  {formatCustomerPhone(order.customerPhone)}
                </td>
                <td className="px-5 py-4 text-[#4b5563]">
                  {formatOrderDateTime(order.placedAt)}
                </td>
                <td className="px-5 py-4">
                  <OrderStepBadge step={order.currentStep} />
                </td>
                <td className="px-5 py-4 capitalize text-[#4b5563]">
                  {order.paymentStatus.replace(/_/g, " ")}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-[#1a1f2e]">
                  {formatInr(order.toPay)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl"
                    asChild
                  >
                    <Link href={`${dashboardRoutePrefix}/orders/${order.id}`}>
                      <Eye className="size-3.5" aria-hidden />
                      <span className="ml-1.5">View</span>
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-[#f0f1f4] px-5 py-4">
          <p className="text-xs text-[#6b7280]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isFetching}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

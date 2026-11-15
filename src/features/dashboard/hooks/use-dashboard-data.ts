"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuth } from "@/features/auth/components/auth-provider";
import { useMerchantCoupons } from "@/features/coupons/hooks/use-merchant-coupons";
import { resolveCouponLifecycle } from "@/features/coupons/types/merchant-coupon";
import { listMerchantCustomers } from "@/features/customers/services";
import { listMerchantOrders, getMerchantOrder } from "@/features/orders/services";
import { listMerchantProducts } from "@/features/products/services";

import {
  aggregateTopProducts,
  buildLast7DaySalesSeries,
  formatPeriodDelta,
  ordersInRange,
  revenueInRange,
  uniqueCustomerPhonesInRange,
  weekPeriodBounds,
  type SalesChartPoint,
  type TopProductRow,
} from "../utils/dashboard-metrics";

export type DashboardStat = {
  label: string;
  value: string;
  delta: string | null;
  footnote?: string;
};

export function useDashboardData() {
  const { user, isRegistered } = useAuth();
  const enabled = Boolean(user && isRegistered);

  const ordersQuery = useQuery({
    queryKey: ["dashboard", "orders"],
    queryFn: () => listMerchantOrders({ page: 1, limit: 100 }),
    enabled,
    staleTime: 30_000,
  });

  const customersQuery = useQuery({
    queryKey: ["dashboard", "customers-total"],
    queryFn: () => listMerchantCustomers({ page: 1, limit: 1 }),
    enabled,
    staleTime: 60_000,
  });

  const productsQuery = useQuery({
    queryKey: ["dashboard", "active-products-total"],
    queryFn: () => listMerchantProducts({ page: 1, limit: 1, isActive: true }),
    enabled,
    staleTime: 60_000,
  });

  const couponsState = useMerchantCoupons();

  const orders = ordersQuery.data?.items ?? [];
  const orderTotal = ordersQuery.data?.pagination.total ?? 0;
  const ordersTruncated = orderTotal > orders.length;

  const recentForDetails = useMemo(
    () => orders.slice(0, 10).map((order) => order.id),
    [orders],
  );

  const orderDetailQueries = useQueries({
    queries: recentForDetails.map((orderId) => ({
      queryKey: ["merchant-order", orderId],
      queryFn: () => getMerchantOrder(orderId),
      enabled: enabled && recentForDetails.length > 0,
      staleTime: 60_000,
    })),
  });

  const metrics = useMemo(() => {
    const { currentStart, currentEnd, previousStart, previousEnd } = weekPeriodBounds();

    const salesCurrent = revenueInRange(orders, currentStart, currentEnd);
    const salesPrevious = revenueInRange(orders, previousStart, previousEnd);
    const ordersCurrent = ordersInRange(orders, currentStart, currentEnd);
    const ordersPrevious = ordersInRange(orders, previousStart, previousEnd);
    const shoppersCurrent = uniqueCustomerPhonesInRange(orders, currentStart, currentEnd);
    const shoppersPrevious = uniqueCustomerPhonesInRange(orders, previousStart, previousEnd);

    const { series, rangeLabel } = buildLast7DaySalesSeries(orders);

    const customerTotal = customersQuery.data?.pagination.total ?? 0;
    const activeProducts = productsQuery.data?.pagination.total ?? 0;

    const loadedDetails = orderDetailQueries
      .filter((q) => q.isSuccess && q.data)
      .map((q) => q.data!);
    const topProducts = aggregateTopProducts(loadedDetails);

    const activeCoupons = couponsState.coupons.filter(
      (coupon) => resolveCouponLifecycle(coupon) === "active",
    ).length;

    const stats: DashboardStat[] = [
      {
        label: "Total Sales",
        value: formatInrCompact(salesCurrent),
        delta: formatPeriodDelta(salesCurrent, salesPrevious),
        footnote: ordersTruncated
          ? `Last 7 days · from latest ${orders.length} orders`
          : "Last 7 days",
      },
      {
        label: "Total Orders",
        value: orderTotal.toLocaleString("en-IN"),
        delta: formatPeriodDelta(ordersCurrent, ordersPrevious),
      },
      {
        label: "Customers",
        value: customerTotal.toLocaleString("en-IN"),
        delta: formatPeriodDelta(shoppersCurrent, shoppersPrevious),
        footnote: "Unique phones · all time",
      },
      {
        label: "Active Products",
        value: activeProducts.toLocaleString("en-IN"),
        delta: null,
        footnote: "Visible on storefront",
      },
    ];

    return {
      stats,
      salesSeries: series,
      salesRangeLabel: rangeLabel,
      recentOrders: orders.slice(0, 5),
      topProducts,
      activeCoupons,
      couponTotal: couponsState.coupons.length,
    };
  }, [
    orders,
    orderTotal,
    ordersTruncated,
    customersQuery.data,
    productsQuery.data,
    orderDetailQueries,
    couponsState.coupons,
  ]);

  const loading =
    enabled &&
    (ordersQuery.isLoading ||
      customersQuery.isLoading ||
      productsQuery.isLoading ||
      (!couponsState.hydrated && couponsState.loading));

  const error =
    ordersQuery.error ?? customersQuery.error ?? productsQuery.error ?? null;

  return {
    enabled,
    loading,
    error,
    refetch: () => {
      void ordersQuery.refetch();
      void customersQuery.refetch();
      void productsQuery.refetch();
    },
    isRefreshing: ordersQuery.isFetching,
    ...metrics,
  };
}

function formatInrCompact(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export type { SalesChartPoint, TopProductRow };
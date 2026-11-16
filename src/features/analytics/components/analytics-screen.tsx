"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BarChart3,
  Box,
  Loader2,
  Package,
  Percent,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
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

import { useAnalyticsPeriod } from "../hooks/use-analytics-period";
import { friendlyAnalyticsError, getMerchantAnalytics } from "../services";
import type { MerchantAnalyticsPeriod } from "../types/merchant-analytics";
import {
  formatAnalyticsDelta,
  formatAnalyticsInr,
} from "../utils/format-analytics";

import { AnalyticsBreakdownPanel } from "./analytics-breakdown-panel";
import { AnalyticsHourChart } from "./analytics-hour-chart";
import { AnalyticsRevenueChart } from "./analytics-revenue-chart";
import { AnalyticsTopProducts } from "./analytics-top-products";

const PERIOD_LABELS: Record<MerchantAnalyticsPeriod, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

export function AnalyticsScreen() {
  const { user, isRegistered } = useAuth();
  const { period, setPeriod, options } = useAnalyticsPeriod();
  const listEnabled = Boolean(user && isRegistered);

  const analyticsQuery = useQuery({
    queryKey: ["merchant-analytics", period],
    queryFn: () => getMerchantAnalytics(period),
    enabled: listEnabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (analyticsQuery.error) {
      toast.error(
        analyticsQuery.error instanceof ApiError
          ? friendlyAnalyticsError(analyticsQuery.error)
          : "Unable to load analytics.",
      );
    }
  }, [analyticsQuery.error]);

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Sign in required"
          message="Sign in to view store analytics."
        />
      </DashboardPage>
    );
  }

  const loading = analyticsQuery.isLoading && !analyticsQuery.data;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-16">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading analytics"
          sublabel="Crunching your store data"
        />
      </div>
    );
  }

  if (analyticsQuery.isError && !analyticsQuery.data) {
    const message =
      analyticsQuery.error instanceof ApiError
        ? friendlyAnalyticsError(analyticsQuery.error)
        : "Unable to load analytics.";
    return (
      <DashboardPage className="py-4">
        <ErrorState
          title="Could not load analytics"
          message={message}
          onRetry={() => void analyticsQuery.refetch()}
        />
      </DashboardPage>
    );
  }

  const report = analyticsQuery.data;
  if (!report) {
    return null;
  }

  const { kpis, previousKpis } = report;

  const statCards = [
    {
      label: "Revenue",
      value: formatAnalyticsInr(kpis.revenue),
      delta: formatAnalyticsDelta(kpis.revenue, previousKpis.revenue),
      icon: Wallet,
      tone: "green",
    },
    {
      label: "Orders",
      value: kpis.orderCount.toLocaleString("en-IN"),
      delta: formatAnalyticsDelta(kpis.orderCount, previousKpis.orderCount),
      icon: ShoppingCart,
      tone: "purple",
    },
    {
      label: "Avg order value",
      value: formatAnalyticsInr(kpis.avgOrderValue, true),
      delta: formatAnalyticsDelta(kpis.avgOrderValue, previousKpis.avgOrderValue),
      icon: TrendingUp,
      tone: "blue",
    },
    {
      label: "Customers",
      value: kpis.uniqueCustomers.toLocaleString("en-IN"),
      delta: formatAnalyticsDelta(kpis.uniqueCustomers, previousKpis.uniqueCustomers),
      icon: Users,
      tone: "orange",
      footnote: `${kpis.newCustomers} new`,
    },
    {
      label: "Units sold",
      value: kpis.itemsSold.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
      delta: formatAnalyticsDelta(kpis.itemsSold, previousKpis.itemsSold),
      icon: Package,
      tone: "slate",
    },
    {
      label: "Coupon orders",
      value: kpis.couponOrderCount.toLocaleString("en-IN"),
      delta: formatAnalyticsDelta(
        kpis.couponOrderCount,
        previousKpis.couponOrderCount,
      ),
      icon: Percent,
      tone: "amber",
    },
  ] as const;

  return (
    <DashboardPage className="gap-4 sm:gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-6 text-[#16a34a]" aria-hidden />
            <h1 className="text-xl font-bold tracking-tight text-[#1a1f2e] sm:text-2xl">
              Analytics
            </h1>
          </div>
          <p className="mt-1 text-sm text-[#6b7280]">
            Store performance · {report.rangeLabel} (IST)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodTabs period={period} options={options} onChange={setPeriod} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 rounded-xl"
            disabled={analyticsQuery.isFetching}
            onClick={() => void analyticsQuery.refetch()}
          >
            <RotateCcw className="size-4" aria-hidden />
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </header>

      {analyticsQuery.isFetching && !analyticsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-xs text-[#6b7280]">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Updating…
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
        {statCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {kpis.cancelledCount > 0 ? (
        <p className="rounded-xl border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
          {kpis.cancelledCount.toLocaleString("en-IN")} cancelled orders in this
          period (excluded from revenue).
        </p>
      ) : null}

      <DashboardSurface className="p-4 sm:p-5">
        <div className="mb-3 flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
          <RevenueSectionHeader
            rangeLabel={report.rangeLabel}
            period={period}
          />
        </div>
        <AnalyticsRevenueChart
          series={report.revenueSeries}
          rangeLabel={report.rangeLabel}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {report.revenueSeries.slice(-4).map((day) => (
            <RecentDayStat key={day.date} day={day} />
          ))}
        </div>
      </DashboardSurface>

      <div className="grid gap-3 lg:grid-cols-2">
        <AnalyticsBreakdownPanel
          title="Order status"
          subtitle="Where orders are in the pipeline"
          items={report.ordersByStep}
        />
        <AnalyticsBreakdownPanel
          title="Payment methods"
          items={report.paymentMethods}
        />
        <AnalyticsBreakdownPanel
          title="Fulfillment"
          items={report.fulfillment}
        />
        <AnalyticsHourChart points={report.ordersByHour} />
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <DashboardSurface className="lg:col-span-3 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#1a1f2e]">Top products</h3>
              <p className="text-xs text-[#9ca3af]">By revenue this period</p>
            </div>
            <Button type="button" variant="ghost" size="sm" className="h-9" asChild>
              <Link href={`${dashboardRoutePrefix}/products`}>
                Products
                <ArrowUpRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </div>
          <AnalyticsTopProducts products={report.topProducts} />
        </DashboardSurface>

        <DashboardSurface className="lg:col-span-2 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-[#1a1f2e]">Catalog health</h3>
          <p className="mt-0.5 text-xs text-[#9ca3af]">Live inventory snapshot</p>
          <ul className="mt-4 flex flex-col gap-3">
            <CatalogRow
              icon={Box}
              label="Active products"
              value={report.catalog.activeProducts}
              href={`${dashboardRoutePrefix}/products`}
            />
            <CatalogRow
              icon={Package}
              label="Low stock"
              value={report.catalog.lowStockCount}
              href={`${dashboardRoutePrefix}/inventory?stock=low_stock`}
              tone="warning"
            />
            <CatalogRow
              icon={Package}
              label="Out of stock"
              value={report.catalog.outOfStockCount}
              href={`${dashboardRoutePrefix}/inventory?stock=out_of_stock`}
              tone="danger"
            />
          </ul>
          <Button
            type="button"
            className="mt-5 h-10 w-full rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d]"
            asChild
          >
            <Link href={`${dashboardRoutePrefix}/orders`}>View all orders</Link>
          </Button>
        </DashboardSurface>
      </div>
    </DashboardPage>
  );
}

function PeriodTabs({
  period,
  options,
  onChange,
}: {
  period: MerchantAnalyticsPeriod;
  options: MerchantAnalyticsPeriod[];
  onChange: (p: MerchantAnalyticsPeriod) => void;
}) {
  return (
    <div
      className="inline-flex rounded-xl border border-[#e8eaef] bg-[#fafbfc] p-1"
      role="tablist"
      aria-label="Analytics period"
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          role="tab"
          aria-selected={period === opt}
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            period === opt
              ? "bg-white text-[#16a34a] shadow-sm"
              : "text-[#6b7280] hover:text-[#1a1f2e]",
          )}
        >
          {PERIOD_LABELS[opt]}
        </button>
      ))}
    </div>
  );
}

function RevenueSectionHeader({
  rangeLabel,
  period,
}: {
  rangeLabel: string;
  period: MerchantAnalyticsPeriod;
}) {
  return (
    <div>
      <h2 className="text-sm font-bold text-[#1a1f2e]">Revenue trend</h2>
      <p className="text-xs text-[#9ca3af]">
        {PERIOD_LABELS[period]} · {rangeLabel}
      </p>
    </div>
  );
}

function RecentDayStat({
  day,
}: {
  day: { date: string; revenue: number; orderCount: number };
}) {
  const date = new Date(`${day.date}T12:00:00`);
  const label = Number.isNaN(date.getTime())
    ? day.date
    : date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
  return (
    <div className="rounded-xl border border-[#f0f1f4] bg-[#fafbfc] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase text-[#9ca3af]">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-[#1a1f2e]">
        {formatAnalyticsInr(day.revenue)}
      </p>
      <p className="text-[10px] text-[#6b7280]">
        {day.orderCount} order{day.orderCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone,
  footnote,
}: {
  label: string;
  value: string;
  delta: string | null;
  icon: typeof Wallet;
  tone: "green" | "purple" | "blue" | "orange" | "slate" | "amber";
  footnote?: string;
}) {
  const tones = {
    green: "bg-[#f0fdf4] text-[#15803d]",
    purple: "bg-[#faf5ff] text-[#9333ea]",
    blue: "bg-[#eff6ff] text-[#2563eb]",
    orange: "bg-[#fff7ed] text-[#ea580c]",
    slate: "bg-[#f8fafc] text-[#475569]",
    amber: "bg-[#fffbeb] text-[#d97706]",
  };
  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-[#eceef2] bg-white p-3 sm:p-4">
      <span
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-xl",
          tones[tone],
        )}
      >
        <Icon className="size-4.5" aria-hidden />
      </span>
      <p className="text-lg font-bold tabular-nums tracking-tight text-[#1a1f2e] sm:text-xl">
        {value}
      </p>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
          {label}
        </p>
        {delta ? (
          <p className="mt-0.5 text-[10px] font-medium text-[#16a34a]">{delta}</p>
        ) : null}
        {footnote ? (
          <p className="mt-0.5 text-[10px] text-[#6b7280]">{footnote}</p>
        ) : null}
      </div>
    </article>
  );
}

function CatalogRow({
  icon: Icon,
  label,
  value,
  href,
  tone,
}: {
  icon: typeof Box;
  label: string;
  value: number;
  href: string;
  tone?: "warning" | "danger";
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-2 rounded-xl border border-[#f0f1f4] bg-[#fafbfc] px-3 py-2.5 transition hover:border-[#e8eaef]"
    >
      <span className="flex items-center gap-2 text-sm text-[#1a1f2e]">
        <Icon
          className={cn(
            "size-4",
            tone === "warning"
              ? "text-[#ea580c]"
              : tone === "danger"
                ? "text-[#dc2626]"
                : "text-[#6b7280]",
          )}
          aria-hidden
        />
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums text-[#1a1f2e]">
        {value.toLocaleString("en-IN")}
      </span>
    </Link>
  );
}
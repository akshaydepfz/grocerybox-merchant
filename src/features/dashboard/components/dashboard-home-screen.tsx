"use client";

import {
  ArrowUpRight,
  Box,
  ExternalLink,
  Link2,
  Loader2,
  PackagePlus,
  Percent,
  ShoppingBag,
  ShoppingCart,
  Store,
  Ticket,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GroceryAnimatedLoader } from "@/components/shared/animated-loader";
import { ErrorState } from "@/components/shared/error-state";
import { merchantStorePublicUrl } from "@/config/store-domain";
import { dashboardRoutePrefix } from "@/config/routes";
import { useAuth } from "@/features/auth/components/auth-provider";
import { OrderStepBadge } from "@/features/orders/components/order-step-badge";
import { formatCustomerPhone, formatInr } from "@/features/orders/utils/format-order";
import { useMerchantProfileQuery } from "@/features/profile/hooks/use-merchant-profile";
import { cn } from "@/lib/utils";

import { useDashboardData } from "../hooks/use-dashboard-data";
import { formatRelativeTime } from "../utils/dashboard-metrics";

import { DashboardHeader } from "./dashboard-header";
import { DashboardSalesChart } from "./dashboard-sales-chart";
import { DashboardSurface } from "./dashboard-surface";

const STAT_ICONS = {
  "Total Sales": {
    icon: ShoppingBag,
    iconBg: "bg-[#dcfce7]",
    iconColor: "text-[#16a34a]",
    cardBg: "bg-[#f0fdf4]",
  },
  "Total Orders": {
    icon: ShoppingCart,
    iconBg: "bg-[#f3e8ff]",
    iconColor: "text-[#9333ea]",
    cardBg: "bg-[#faf5ff]",
  },
  Customers: {
    icon: Users,
    iconBg: "bg-[#ffedd5]",
    iconColor: "text-[#ea580c]",
    cardBg: "bg-[#fff7ed]",
  },
  "Active Products": {
    icon: Box,
    iconBg: "bg-[#fee2e2]",
    iconColor: "text-[#dc2626]",
    cardBg: "bg-[#fef2f2]",
  },
} as const;

const THUMB_GRADIENTS = [
  "from-orange-200 to-red-200",
  "from-sky-200 to-blue-200",
  "from-lime-200 to-green-200",
  "from-violet-200 to-purple-200",
  "from-amber-200 to-yellow-200",
];

function thumbGradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i)) % THUMB_GRADIENTS.length;
  }
  return THUMB_GRADIENTS[hash] ?? THUMB_GRADIENTS[0]!;
}

export function DashboardHomeScreen() {
  const { user, isRegistered } = useAuth();
  const profileQuery = useMerchantProfileQuery();
  const dashboard = useDashboardData();

  const storefrontUrl = profileQuery.data?.store?.subdomain
    ? merchantStorePublicUrl(profileQuery.data.store.subdomain)
    : null;

  const copyStoreLink = async () => {
    if (!storefrontUrl) {
      toast.error("Publish your store to get a shareable link.");
      return;
    }
    try {
      await navigator.clipboard.writeText(storefrontUrl);
      toast.success("Store link copied.");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[1200px] py-4">
        <ErrorState
          title="Sign in required"
          message="Sign in to view your store dashboard."
        />
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="mx-auto w-full max-w-[1200px] py-4">
        <ErrorState
          title="Complete onboarding"
          message="Finish merchant registration to see live store metrics."
          action={
            <Button type="button" asChild>
              <Link href="/onboarding">Continue onboarding</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (dashboard.loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <GroceryAnimatedLoader
          theme="dashboard"
          label="Loading dashboard"
          sublabel="Fetching orders and catalog"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 sm:gap-6">
      <DashboardHeader />

      {dashboard.isRefreshing ? (
        <div className="flex items-center gap-2 text-xs text-[#6b7280]">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Refreshing metrics…
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
        {dashboard.stats.map((stat) => {
          const visual = STAT_ICONS[stat.label as keyof typeof STAT_ICONS];
          const Icon = visual.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-[#e8f5e9] p-3.5 sm:p-5",
                visual.cardBg,
              )}
            >
              <div
                className={cn(
                  "absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-xl sm:right-4 sm:top-4 sm:size-11",
                  visual.iconBg,
                )}
              >
                <Icon
                  className={cn("size-4 sm:size-5", visual.iconColor)}
                  aria-hidden
                />
              </div>
              <p className="pr-8 text-[11px] font-medium text-[#6b7280] sm:pr-0 sm:text-sm">
                {stat.label}
              </p>
              <p className="mt-1.5 text-lg font-bold tracking-tight text-[#1a1f2e] sm:mt-2 sm:text-2xl">
                {stat.value}
              </p>
              {stat.delta ? (
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[#16a34a]">
                  <ArrowUpRight className="size-3.5" aria-hidden />
                  {stat.delta}
                </p>
              ) : stat.footnote ? (
                <p className="mt-2 text-xs text-[#9ca3af]">{stat.footnote}</p>
              ) : null}
              {stat.delta && stat.footnote ? (
                <p className="mt-1 text-[10px] text-[#9ca3af]">{stat.footnote}</p>
              ) : null}
            </div>
          );
        })}
      </section>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <DashboardSurface className="order-2 p-4 sm:p-5 lg:order-1 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#1a1f2e]">
                Sales Overview
              </h2>
              <p className="mt-0.5 text-xs text-[#9ca3af]">
                {dashboard.salesRangeLabel}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[#6b7280]"
              asChild
            >
              <Link href={`${dashboardRoutePrefix}/orders`}>View orders</Link>
            </Button>
          </div>
          <div className="mt-3 h-44 w-full sm:mt-4 sm:h-52">
            <DashboardSalesChart
              points={dashboard.salesSeries}
              rangeLabel={dashboard.salesRangeLabel}
            />
          </div>
        </DashboardSurface>

        <div className="order-1 flex flex-col gap-3 sm:gap-4 lg:order-2">
          <div className="relative overflow-hidden rounded-2xl bg-[#bef264] p-4 sm:p-5">
            <div className="pointer-events-none absolute -right-4 top-2 opacity-90">
              <Ticket className="size-20 text-[#0a3d32]/15" strokeWidth={1.2} />
            </div>
            <p className="text-lg font-bold text-[#0a3d32]">Coupons &amp; offers</p>
            <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-[#0a3d32]/80">
              {dashboard.activeCoupons > 0
                ? `${dashboard.activeCoupons} active coupon${dashboard.activeCoupons === 1 ? "" : "s"} running on your storefront.`
                : "Create discount codes customers can apply at checkout."}
            </p>
            <CouponCardActions
              activeCoupons={dashboard.activeCoupons}
              couponTotal={dashboard.couponTotal}
            />
          </div>

          <DashboardSurface className="p-3 sm:p-4">
            <p className="px-1 text-sm font-semibold text-[#1a1f2e]">Quick Actions</p>
            <QuickActions
              storefrontUrl={storefrontUrl}
              onCopyStoreLink={() => void copyStoreLink()}
            />
          </DashboardSurface>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSurface>
          <RecentOrdersSection recentOrders={dashboard.recentOrders} />
        </DashboardSurface>

        <DashboardSurface>
          <TopProductsSection topProducts={dashboard.topProducts} />
        </DashboardSurface>
      </div>
    </div>
  );
}

function CouponCardActions({
  activeCoupons,
  couponTotal,
}: {
  activeCoupons: number;
  couponTotal: number;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button
        type="button"
        className="h-9 rounded-xl bg-[#0a3d32] px-4 text-xs font-semibold text-white hover:bg-[#062f27]"
        asChild
      >
        <Link href={`${dashboardRoutePrefix}/coupons/new`}>Create coupon</Link>
      </Button>
      {couponTotal > 0 ? (
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-xl border-[#0a3d32]/20 bg-white/60 px-4 text-xs font-semibold text-[#0a3d32]"
          asChild
        >
          <Link href={`${dashboardRoutePrefix}/coupons`}>
            {activeCoupons > 0 ? "Manage coupons" : "View coupons"}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function QuickActions({
  storefrontUrl,
  onCopyStoreLink,
}: {
  storefrontUrl: string | null;
  onCopyStoreLink: () => void;
}) {
  type QuickAction =
    | {
        label: string;
        icon: typeof PackagePlus;
        kind: "link";
        href: string;
        external?: boolean;
      }
    | {
        label: string;
        icon: typeof Link2;
        kind: "button";
        onClick: () => void;
      };

  const actions: QuickAction[] = [
    {
      label: "Add Product",
      icon: PackagePlus,
      kind: "link",
      href: `${dashboardRoutePrefix}/products/new`,
    },
    {
      label: "Add Coupon",
      icon: Percent,
      kind: "link",
      href: `${dashboardRoutePrefix}/coupons/new`,
    },
    {
      label: "View Store",
      icon: Store,
      kind: "link",
      href: storefrontUrl ?? `${dashboardRoutePrefix}/profile`,
      external: Boolean(storefrontUrl),
    },
    {
      label: "Share Link",
      icon: Link2,
      kind: "button",
      onClick: onCopyStoreLink,
    },
  ];

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        const inner = (
          <>
            <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <Icon className="size-[18px] text-[#16a34a]" />
            </span>
            {action.label}
          </>
        );

        if (action.kind === "link") {
          return (
            <Link
              key={action.label}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              className="flex flex-col items-center gap-2 rounded-xl border border-[#f0f1f4] bg-[#fafbfc] px-2 py-4 text-center text-xs font-medium text-[#374151] transition hover:bg-white"
            >
              {inner}
            </Link>
          );
        }

        return (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 rounded-xl border border-[#f0f1f4] bg-[#fafbfc] px-2 py-4 text-center text-xs font-medium text-[#374151] transition hover:bg-white"
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

function RecentOrdersSection({
  recentOrders,
}: {
  recentOrders: ReturnType<typeof useDashboardData>["recentOrders"];
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-[#f0f1f4] px-5 py-4">
        <h2 className="text-base font-semibold text-[#1a1f2e]">Recent Orders</h2>
        <Link
          href={`${dashboardRoutePrefix}/orders`}
          className="flex items-center gap-1 text-xs font-medium text-[#16a34a]"
        >
          View all
          <ExternalLink className="size-3" />
        </Link>
      </div>
      {recentOrders.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[#6b7280]">
          Storefront orders will show up here once customers check out.
        </p>
      ) : (
        <ul className="divide-y divide-[#f0f1f4]">
          {recentOrders.map((order) => (
            <li key={order.id} className="flex items-center gap-3 px-5 py-4">
              <div
                className={cn(
                  "size-12 shrink-0 rounded-xl bg-gradient-to-br",
                  thumbGradientForId(order.id),
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`${dashboardRoutePrefix}/orders/${order.id}`}
                    className="text-sm font-semibold text-[#1a1f2e] hover:text-[#16a34a]"
                  >
                    #{order.orderNumber}
                  </Link>
                  <OrderStepBadge step={order.currentStep} />
                </div>
                <p className="mt-0.5 truncate text-xs text-[#6b7280]">
                  {order.lineCount} line{order.lineCount === 1 ? "" : "s"} ·{" "}
                  {order.deliveryLabel || order.fulfillmentMethod.replace(/_/g, " ")}
                </p>
                <p className="text-[10px] text-[#9ca3af]">
                  {formatCustomerPhone(order.customerPhone)} ·{" "}
                  {formatRelativeTime(order.placedAt)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-[#1a1f2e]">
                {formatInr(order.toPay)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function TopProductsSection({
  topProducts,
}: {
  topProducts: ReturnType<typeof useDashboardData>["topProducts"];
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-[#f0f1f4] px-5 py-4">
        <h2 className="text-base font-semibold text-[#1a1f2e]">
          Top Selling Products
        </h2>
        <Link
          href={`${dashboardRoutePrefix}/products`}
          className="text-xs font-medium text-[#16a34a]"
        >
          See all
        </Link>
      </div>
      {topProducts.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[#6b7280]">
          Top sellers appear from your latest storefront orders.
        </p>
      ) : (
        <ul className="divide-y divide-[#f0f1f4]">
          {topProducts.map((product, index) => (
            <li key={product.name} className="px-5 py-4">
              <div className="flex items-center gap-3">
                <ProductThumb product={product} index={index} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1a1f2e]">
                    {product.name}
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    {product.orderLines} order line
                    {product.orderLines === 1 ? "" : "s"} · {formatInr(product.revenue)}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f3f4f6]">
                    <div
                      className="h-full rounded-full bg-[#22c55e]"
                      style={{ width: `${product.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function ProductThumb({
  product,
  index,
}: {
  product: ReturnType<typeof useDashboardData>["topProducts"][number];
  index: number;
}) {
  if (product.imageUrl) {
    return (
      <div className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-[#f3f4f6]">
        <Image
          src={product.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="40px"
          unoptimized
        />
      </div>
    );
  }

  return <ProductThumbFallback index={index} name={product.name} />;
}

function ProductThumbFallback({ index, name }: { index: number; name: string }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-[#374151]",
        index === 0 && "bg-[#fef9c3]",
        index === 1 && "bg-[#ffedd5]",
        index === 2 && "bg-[#f3f4f6]",
        index === 3 && "bg-[#e0f2fe]",
      )}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
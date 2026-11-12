"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Leaf,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEKLY_SALES = [
  { day: "Mon", value: 62 },
  { day: "Tue", value: 78 },
  { day: "Wed", value: 71 },
  { day: "Thu", value: 88 },
  { day: "Fri", value: 95 },
  { day: "Sat", value: 100 },
  { day: "Sun", value: 84 },
] as const;

const RECENT_ORDERS = [
  {
    id: "#GB-4821",
    customer: "Ananya R.",
    items: 14,
    total: "₹2,340",
    status: "Preparing",
    statusTone: "amber" as const,
  },
  {
    id: "#GB-4819",
    customer: "Rahul M.",
    items: 6,
    total: "₹890",
    status: "Out for delivery",
    statusTone: "blue" as const,
  },
  {
    id: "#GB-4815",
    customer: "Priya K.",
    items: 22,
    total: "₹4,120",
    status: "Delivered",
    statusTone: "green" as const,
  },
  {
    id: "#GB-4812",
    customer: "Vikram S.",
    items: 9,
    total: "₹1,560",
    status: "Delivered",
    statusTone: "green" as const,
  },
] as const;

const LOW_STOCK = [
  { name: "Organic tomatoes", sku: "VEG-TOM-1K", left: 8, unit: "kg" },
  { name: "Amul butter", sku: "DAI-BTR-500", left: 12, unit: "packs" },
  { name: "Basmati rice 5kg", sku: "GRN-RIC-5K", left: 5, unit: "bags" },
] as const;

const STAT_CARDS = [
  {
    title: "Today's revenue",
    value: "₹48,250",
    change: "+12.4%",
    up: true,
    icon: TrendingUp,
    accent: "from-emerald-500/15 to-gb-onboard-feature-emerald",
  },
  {
    title: "Active orders",
    value: "37",
    change: "+5 since morning",
    up: true,
    icon: ShoppingCart,
    accent: "from-lime-500/15 to-gb-mo-step-active-bg",
  },
  {
    title: "SKUs live",
    value: "1,248",
    change: "18 added this week",
    up: true,
    icon: Package,
    accent: "from-green-600/10 to-white",
  },
  {
    title: "Delivery SLA",
    value: "94%",
    change: "-2.1% vs last week",
    up: false,
    icon: Truck,
    accent: "from-gb-mo-address-bg to-white",
  },
] as const;

const statusStyles = {
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  blue: "bg-sky-50 text-sky-800 ring-sky-200",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
} as const;

export function DashboardHomeScreen() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-gb-mo-address-border bg-gradient-to-br from-gb-primary via-gb-secondary to-gb-onboard-emerald-700 p-6 text-white shadow-gb-md sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-gb-accent/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/3 size-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Leaf className="size-3.5" aria-hidden />
              Your store is open for delivery
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Good evening — here&apos;s your grocery pulse
            </h2>
            <p className="max-w-xl text-sm text-emerald-50/90 sm:text-base">
              Track orders, restock fast movers, and keep produce fresh. Numbers
              below are sample data until your Go API is connected.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="bg-gb-accent text-gb-primary hover:bg-gb-accent/90"
              disabled
            >
              New promotion
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              disabled
            >
              Add product
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="overflow-hidden border-gb-border py-0 shadow-gb-sm"
            >
              <CardContent className="p-0">
                <div
                  className={cn(
                    "border-b border-gb-border/60 bg-gradient-to-br px-5 py-4",
                    stat.accent,
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gb-mo-gray-500">
                        {stat.title}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-gb-mo-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon className="size-5 text-gb-secondary" aria-hidden />
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-5 py-3 text-xs font-medium">
                  {stat.up ? (
                    <ArrowUpRight className="size-3.5 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="size-3.5 text-amber-600" />
                  )}
                  <span
                    className={stat.up ? "text-emerald-700" : "text-amber-700"}
                  >
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-gb-border py-0 shadow-gb-sm lg:col-span-3">
          <CardHeader className="border-b border-gb-border/80 py-5">
            <CardTitle className="text-base">Weekly sales</CardTitle>
            <CardDescription>Demo trend — last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <div className="flex h-44 items-end justify-between gap-2 sm:gap-3">
              {WEEKLY_SALES.map((bar) => (
                <div
                  key={bar.day}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-36 w-full items-end justify-center">
                    <div
                      className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-gb-primary to-gb-mo-continue transition-all"
                      style={{ height: `${bar.value}%` }}
                      role="img"
                      aria-label={`${bar.day}: ${bar.value}% of peak`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-gb-mo-gray-500">
                    {bar.day}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gb-border py-0 shadow-gb-sm lg:col-span-2">
          <CardHeader className="border-b border-gb-border/80 py-5">
            <CardTitle className="text-base">Low stock</CardTitle>
            <CardDescription>Restock before peak hours</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-gb-border/80 p-0">
            {LOW_STOCK.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between gap-3 px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gb-mo-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gb-mo-gray-500">{item.sku}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                  {item.left} {item.unit}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-gb-border py-0 shadow-gb-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-gb-border/80 py-5">
          <div>
            <CardTitle className="text-base">Recent orders</CardTitle>
            <CardDescription>Latest activity in your store</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" disabled>
            View all
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gb-border bg-gb-mo-gray-100/60 text-xs uppercase tracking-wide text-gb-mo-gray-500">
                  <th className="px-6 py-3 font-medium">Order</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Items</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gb-border/60 last:border-0 hover:bg-gb-onboard-wave-fill/80"
                  >
                    <td className="px-6 py-4 font-medium text-gb-mo-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-gb-mo-gray-700">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 text-gb-mo-gray-600">
                      {order.items}
                    </td>
                    <td className="px-6 py-4 font-medium text-gb-mo-gray-900">
                      {order.total}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                          statusStyles[order.statusTone],
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import {
  ArrowUpRight,
  Box,
  ExternalLink,
  Link2,
  Megaphone,
  PackagePlus,
  Percent,
  ShoppingBag,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { DashboardHeader } from "./dashboard-header";
import { DashboardSalesChart } from "./dashboard-sales-chart";
import { DashboardSurface } from "./dashboard-surface";

const STATS = [
  {
    label: "Total Sales",
    value: "₹24,860",
    delta: "+12.5% vs. last 7 days",
    icon: ShoppingBag,
    iconBg: "bg-[#dcfce7]",
    iconColor: "text-[#16a34a]",
    cardBg: "bg-[#f0fdf4]",
  },
  {
    label: "Total Orders",
    value: "148",
    delta: "+8.1% vs. last 7 days",
    icon: ShoppingCart,
    iconBg: "bg-[#f3e8ff]",
    iconColor: "text-[#9333ea]",
    cardBg: "bg-[#faf5ff]",
  },
  {
    label: "Customers",
    value: "312",
    delta: "+16.4% vs. last 7 days",
    icon: Users,
    iconBg: "bg-[#ffedd5]",
    iconColor: "text-[#ea580c]",
    cardBg: "bg-[#fff7ed]",
  },
  {
    label: "Active Products",
    value: "486",
    delta: "+4.2% vs. last 7 days",
    icon: Box,
    iconBg: "bg-[#fee2e2]",
    iconColor: "text-[#dc2626]",
    cardBg: "bg-[#fef2f2]",
  },
] as const;

const RECENT_ORDERS = [
  {
    id: "GB2841",
    customer: "Ananya R.",
    items: "Tomatoes, Onions, Basmati Rice",
    time: "15 min ago",
    total: "₹1,240",
    status: "Delivered" as const,
    thumb: "from-orange-200 to-red-200",
  },
  {
    id: "GB2840",
    customer: "Rahul M.",
    items: "Amul Milk, Bread, Eggs",
    time: "32 min ago",
    total: "₹520",
    status: "Preparing" as const,
    thumb: "from-sky-200 to-blue-200",
  },
  {
    id: "GB2839",
    customer: "Priya K.",
    items: "Bananas, Apples, Spinach",
    time: "48 min ago",
    total: "₹780",
    status: "Out for Delivery" as const,
    thumb: "from-lime-200 to-green-200",
  },
] as const;

const TOP_PRODUCTS = [
  { name: "Fresh Bananas", orders: 86, revenue: "₹12,450", pct: 100, emoji: "🍌" },
  { name: "Organic Tomatoes", orders: 72, revenue: "₹9,820", pct: 78, emoji: "🍅" },
  { name: "Amul Butter 500g", orders: 58, revenue: "₹8,140", pct: 62, emoji: "🧈" },
  { name: "Basmati Rice 5kg", orders: 41, revenue: "₹6,200", pct: 48, emoji: "🍚" },
] as const;

const QUICK_ACTIONS = [
  { label: "Add Product", icon: PackagePlus },
  { label: "Create Offer", icon: Percent },
  { label: "View Store", icon: Store },
  { label: "Share Link", icon: Link2 },
] as const;

const STATUS_STYLES = {
  Delivered: "bg-[#dcfce7] text-[#15803d]",
  Preparing: "bg-[#ffedd5] text-[#c2410c]",
  "Out for Delivery": "bg-[#f3e8ff] text-[#7e22ce]",
} as const;

export function DashboardHomeScreen() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <DashboardHeader />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-[#e8f5e9] p-5",
                stat.cardBg,
              )}
            >
              <div
                className={cn(
                  "absolute right-4 top-4 flex size-11 items-center justify-center rounded-xl",
                  stat.iconBg,
                )}
              >
                <Icon className={cn("size-5", stat.iconColor)} aria-hidden />
              </div>
              <p className="text-sm font-medium text-[#6b7280]">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#1a1f2e]">
                {stat.value}
              </p>
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[#16a34a]">
                <ArrowUpRight className="size-3.5" aria-hidden />
                {stat.delta}
              </p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSurface className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#1a1f2e]">
                Sales Overview
              </h2>
              <p className="mt-0.5 text-xs text-[#9ca3af]">Nov 6 – Nov 12</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[#6b7280]"
              disabled
            >
              View report
            </Button>
          </div>
          <div className="mt-4 h-52 w-full">
            <DashboardSalesChart />
          </div>
        </DashboardSurface>

        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-[#bef264] p-5">
            <div className="pointer-events-none absolute -right-4 top-2 opacity-90">
              <Megaphone className="size-20 text-[#0a3d32]/15" strokeWidth={1.2} />
            </div>
            <p className="text-lg font-bold text-[#0a3d32]">
              Boost Your Sales!
            </p>
            <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-[#0a3d32]/80">
              Create seasonal offers and reach more customers in your delivery
              zone.
            </p>
            <Button
              type="button"
              className="mt-4 h-9 rounded-xl bg-[#0a3d32] px-4 text-xs font-semibold text-white hover:bg-[#062f27]"
              disabled
            >
              Create Offer
            </Button>
          </div>

          <DashboardSurface className="p-4">
            <p className="px-1 text-sm font-semibold text-[#1a1f2e]">
              Quick Actions
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    disabled
                    className="flex flex-col items-center gap-2 rounded-xl border border-[#f0f1f4] bg-[#fafbfc] px-2 py-4 text-center text-xs font-medium text-[#374151] transition hover:bg-white"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon className="size-[18px] text-[#16a34a]" />
                    </span>
                    {action.label}
                  </button>
                );
              })}
            </div>
          </DashboardSurface>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSurface>
          <div className="flex items-center justify-between border-b border-[#f0f1f4] px-5 py-4">
            <h2 className="text-base font-semibold text-[#1a1f2e]">
              Recent Orders
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-medium text-[#16a34a]"
              disabled
            >
              View all
              <ExternalLink className="size-3" />
            </button>
          </div>
          <ul className="divide-y divide-[#f0f1f4]">
            {RECENT_ORDERS.map((order) => (
              <li
                key={order.id}
                className="flex items-center gap-3 px-5 py-4"
              >
                <div
                  className={cn(
                    "size-12 shrink-0 rounded-xl bg-gradient-to-br",
                    order.thumb,
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#1a1f2e]">
                      #{order.id}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        STATUS_STYLES[order.status],
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#6b7280]">
                    {order.items}
                  </p>
                  <p className="text-[10px] text-[#9ca3af]">
                    {order.customer} · {order.time}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-[#1a1f2e]">
                  {order.total}
                </p>
              </li>
            ))}
          </ul>
        </DashboardSurface>

        <DashboardSurface>
          <div className="flex items-center justify-between border-b border-[#f0f1f4] px-5 py-4">
            <h2 className="text-base font-semibold text-[#1a1f2e]">
              Top Selling Products
            </h2>
            <button
              type="button"
              className="text-xs font-medium text-[#16a34a]"
              disabled
            >
              See all
            </button>
          </div>
          <ul className="divide-y divide-[#f0f1f4]">
            {TOP_PRODUCTS.map((product, index) => (
              <li key={product.name} className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl text-lg",
                      index === 0 && "bg-[#fef9c3]",
                      index === 1 && "bg-[#ffedd5]",
                      index === 2 && "bg-[#f3f4f6]",
                      index === 3 && "bg-[#e0f2fe]",
                    )}
                    aria-hidden
                  >
                    {product.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1a1f2e]">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#9ca3af]">
                      {product.orders} orders · {product.revenue}
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
        </DashboardSurface>
      </div>
    </div>
  );
}

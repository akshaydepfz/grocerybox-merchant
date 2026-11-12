"use client";

import { Button } from "@/components/ui/button";
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
    id: "GB-4821",
    customer: "Ananya R.",
    items: 14,
    total: "₹2,340",
    status: "Preparing",
  },
  {
    id: "GB-4819",
    customer: "Rahul M.",
    items: 6,
    total: "₹890",
    status: "Out for delivery",
  },
  {
    id: "GB-4815",
    customer: "Priya K.",
    items: 22,
    total: "₹4,120",
    status: "Delivered",
  },
  {
    id: "GB-4812",
    customer: "Vikram S.",
    items: 9,
    total: "₹1,560",
    status: "Delivered",
  },
] as const;

const LOW_STOCK = [
  { name: "Organic tomatoes", sku: "VEG-TOM-1K", left: 8, unit: "kg" },
  { name: "Amul butter", sku: "DAI-BTR-500", left: 12, unit: "packs" },
  { name: "Basmati rice 5kg", sku: "GRN-RIC-5K", left: 5, unit: "bags" },
] as const;

const METRICS = [
  { label: "Revenue today", value: "₹48,250", delta: "+12.4% vs yesterday" },
  { label: "Open orders", value: "37", delta: "+5 since 9:00 AM" },
  { label: "Active SKUs", value: "1,248", delta: "18 added this week" },
  { label: "On-time delivery", value: "94%", delta: "−2.1% vs last week" },
] as const;

function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground",
        className,
      )}
    >
      {children}
    </section>
  );
}

function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div>
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Delivered"
      ? "text-gb-mo-gray-700"
      : status === "Preparing"
        ? "text-gb-mo-gray-900"
        : "text-gb-mo-gray-700";

  return (
    <span className={cn("text-xs font-medium", tone)}>
      {status}
    </span>
  );
}

export function DashboardHomeScreen() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Thursday, 12 Nov 2026</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Overview
          </h2>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            Summary metrics for your store. Figures are illustrative until
            connected to the merchant API.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled>
            Export
          </Button>
          <Button type="button" size="sm" disabled>
            Add product
          </Button>
        </div>
      </div>

      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <div key={metric.label} className="bg-card px-5 py-4">
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Sales"
            description="Last 7 days (sample)"
          />
          <div className="px-5 py-5">
            <div className="flex h-40 items-end gap-3">
              {WEEKLY_SALES.map((bar) => (
                <div
                  key={bar.day}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-sm bg-gb-secondary/80"
                      style={{ height: `${bar.value}%` }}
                      role="img"
                      aria-label={`${bar.day}: ${bar.value}%`}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {bar.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Low stock"
            description="Below reorder threshold"
          />
          <ul className="divide-y divide-border">
            {LOW_STOCK.map((item) => (
              <li
                key={item.sku}
                className="flex items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-foreground">
                  {item.left} {item.unit}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Recent orders"
          description="Latest transactions"
          action={
            <Button type="button" variant="ghost" size="sm" disabled>
              View all
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium text-right">Items</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-5 py-3 font-medium tabular-nums text-foreground">
                    {order.id}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {order.customer}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                    {order.items}
                  </td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums text-foreground">
                    {order.total}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

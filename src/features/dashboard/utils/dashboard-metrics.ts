import type { MerchantOrderDetail, MerchantOrderListItem } from "@/features/orders/types/merchant-order";

export type SalesChartPoint = {
  label: string;
  value: number;
  dateKey: string;
};

export type TopProductRow = {
  name: string;
  orderLines: number;
  revenue: number;
  imageUrl: string | null;
  pct: number;
};

const MS_PER_DAY = 86_400_000;

function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatShortDay(date: Date): string {
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function buildLast7DaySalesSeries(
  orders: MerchantOrderListItem[],
  now = new Date(),
): { series: SalesChartPoint[]; rangeLabel: string } {
  const today = startOfLocalDay(now);
  const days: Date[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    days.push(new Date(today.getTime() - i * MS_PER_DAY));
  }

  const buckets = new Map<string, number>();
  for (const day of days) {
    buckets.set(day.toISOString().slice(0, 10), 0);
  }

  for (const order of orders) {
    const placed = new Date(order.placedAt);
    if (Number.isNaN(placed.getTime())) {
      continue;
    }
    const key = startOfLocalDay(placed).toISOString().slice(0, 10);
    if (!buckets.has(key)) {
      continue;
    }
    buckets.set(key, (buckets.get(key) ?? 0) + order.toPay);
  }

  const series = days.map((day) => {
    const key = day.toISOString().slice(0, 10);
    return {
      dateKey: key,
      label: formatShortDay(day),
      value: buckets.get(key) ?? 0,
    };
  });

  const rangeLabel = `${formatShortDay(days[0]!)} – ${formatShortDay(days[days.length - 1]!)}`;

  return { series, rangeLabel };
}

export function revenueInRange(
  orders: MerchantOrderListItem[],
  startInclusive: Date,
  endExclusive: Date,
): number {
  let total = 0;
  for (const order of orders) {
    const placed = new Date(order.placedAt);
    if (Number.isNaN(placed.getTime())) {
      continue;
    }
    if (placed >= startInclusive && placed < endExclusive) {
      total += order.toPay;
    }
  }
  return total;
}

export function ordersInRange(
  orders: MerchantOrderListItem[],
  startInclusive: Date,
  endExclusive: Date,
): number {
  let count = 0;
  for (const order of orders) {
    const placed = new Date(order.placedAt);
    if (Number.isNaN(placed.getTime())) {
      continue;
    }
    if (placed >= startInclusive && placed < endExclusive) {
      count += 1;
    }
  }
  return count;
}

export function uniqueCustomerPhonesInRange(
  orders: MerchantOrderListItem[],
  startInclusive: Date,
  endExclusive: Date,
): number {
  const phones = new Set<string>();
  for (const order of orders) {
    const placed = new Date(order.placedAt);
    if (Number.isNaN(placed.getTime())) {
      continue;
    }
    if (placed >= startInclusive && placed < endExclusive && order.customerPhone) {
      phones.add(order.customerPhone);
    }
  }
  return phones.size;
}

export function formatPeriodDelta(current: number, previous: number): string | null {
  if (previous <= 0 && current <= 0) {
    return null;
  }
  if (previous <= 0) {
    return "New activity this week";
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% vs. previous 7 days`;
}

export function sumOrderRevenue(orders: MerchantOrderListItem[]): number {
  return orders.reduce((sum, order) => sum + order.toPay, 0);
}

export function aggregateTopProducts(details: MerchantOrderDetail[]): TopProductRow[] {
  const map = new Map<
    string,
    { name: string; orderLines: number; revenue: number; imageUrl: string | null }
  >();

  for (const order of details) {
    for (const line of order.lines) {
      const key = line.productId || line.name;
      const existing = map.get(key);
      if (existing) {
        existing.orderLines += 1;
        existing.revenue += line.lineSellingTotal;
      } else {
        map.set(key, {
          name: line.name,
          orderLines: 1,
          revenue: line.lineSellingTotal,
          imageUrl: line.imageUrl ?? null,
        });
      }
    }
  }

  const sorted = [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 4);
  const maxRevenue = sorted[0]?.revenue ?? 0;

  return sorted.map((row) => ({
    ...row,
    pct: maxRevenue > 0 ? Math.round((row.revenue / maxRevenue) * 100) : 0,
  }));
}

export function formatRelativeTime(iso: string, now = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) {
    return "—";
  }
  const diffMs = now.getTime() - then.getTime();
  if (diffMs < 0) {
    return "Just now";
  }
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  return then.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function weekPeriodBounds(now = new Date()) {
  const today = startOfLocalDay(now);
  const currentStart = new Date(today.getTime() - 6 * MS_PER_DAY);
  const currentEnd = new Date(today.getTime() + MS_PER_DAY);
  const previousStart = new Date(currentStart.getTime() - 7 * MS_PER_DAY);
  const previousEnd = currentStart;
  return { currentStart, currentEnd, previousStart, previousEnd };
}
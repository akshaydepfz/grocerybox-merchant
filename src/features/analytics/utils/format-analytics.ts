import type { MerchantAnalyticsDailyPoint } from "../types/merchant-analytics";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrPreciseFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatAnalyticsInr(amount: number, precise = false): string {
  if (!Number.isFinite(amount)) {
    return precise ? inrPreciseFormatter.format(0) : inrFormatter.format(0);
  }
  return precise ? inrPreciseFormatter.format(amount) : inrFormatter.format(amount);
}

export function formatAnalyticsDelta(
  current: number,
  previous: number,
): string | null {
  if (previous <= 0 && current <= 0) {
    return null;
  }
  if (previous <= 0) {
    return "New this period";
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% vs prior period`;
}

export function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 am";
  if (hour < 12) return `${hour} am`;
  if (hour === 12) return "12 pm";
  return `${hour - 12} pm`;
}

export function chartPointsFromSeries(
  series: MerchantAnalyticsDailyPoint[],
): { label: string; value: number; dateKey: string }[] {
  return series.map((point) => {
    const date = new Date(`${point.date}T12:00:00`);
    const label = Number.isNaN(date.getTime())
      ? point.date
      : date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    return {
      dateKey: point.date,
      label,
      value: point.revenue,
    };
  });
}

export function breakdownMaxCount(
  items: { count: number }[],
): number {
  return Math.max(1, ...items.map((item) => item.count));
}
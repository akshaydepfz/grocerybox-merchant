"use client";

import type { MerchantAnalyticsHourPoint } from "../types/merchant-analytics";
import { formatHourLabel } from "../utils/format-analytics";

type AnalyticsHourChartProps = {
  points: MerchantAnalyticsHourPoint[];
};

export function AnalyticsHourChart({ points }: AnalyticsHourChartProps) {
  const maxCount = Math.max(1, ...points.map((p) => p.orderCount));
  const peak = points.reduce(
    (best, point) => (point.orderCount > best.orderCount ? point : best),
    points[0] ?? { hour: 0, orderCount: 0 },
  );

  return (
    <div className="rounded-2xl border border-[#eceef2] bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#1a1f2e]">Busiest hours</h3>
          <p className="mt-0.5 text-xs text-[#9ca3af]">Order volume by time of day (IST)</p>
        </div>
        {peak.orderCount > 0 ? (
          <p className="rounded-full bg-[#f0fdf4] px-2.5 py-1 text-[10px] font-semibold text-[#15803d]">
            Peak {formatHourLabel(peak.hour)}
          </p>
        ) : null}
      </div>
      <div
        className="mt-4 flex h-32 items-end gap-0.5"
        role="img"
        aria-label="Orders by hour"
      >
        {points.map((point) => {
          const heightPct = (point.orderCount / maxCount) * 100;
          const isPeak = point.hour === peak.hour && peak.orderCount > 0;
          return (
            <div
              key={point.hour}
              className="group flex flex-1 flex-col items-center justify-end"
              title={`${formatHourLabel(point.hour)}: ${point.orderCount} orders`}
            >
              <div
                className={`w-full max-w-[14px] rounded-t-sm transition ${
                  isPeak
                    ? "bg-[#16a34a]"
                    : point.orderCount > 0
                      ? "bg-[#86efac]"
                      : "bg-[#f3f4f6]"
                }`}
                style={{
                  height: `${Math.max(heightPct, point.orderCount > 0 ? 6 : 2)}%`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-[#9ca3af]">
        <span>12 am</span>
        <span>12 pm</span>
        <span>11 pm</span>
      </div>
    </div>
  );
}
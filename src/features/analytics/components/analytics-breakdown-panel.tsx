"use client";

import type { MerchantAnalyticsBreakdownItem } from "../types/merchant-analytics";
import { breakdownMaxCount, formatAnalyticsInr } from "../utils/format-analytics";

type AnalyticsBreakdownPanelProps = {
  title: string;
  subtitle?: string;
  items: MerchantAnalyticsBreakdownItem[];
  showRevenue?: boolean;
};

export function AnalyticsBreakdownPanel({
  title,
  subtitle,
  items,
  showRevenue = true,
}: AnalyticsBreakdownPanelProps) {
  const maxCount = breakdownMaxCount(items);

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-[#eceef2] bg-white p-4">
        <h3 className="text-sm font-bold text-[#1a1f2e]">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-[#9ca3af]">{subtitle}</p> : null}
        <p className="mt-6 text-sm text-[#9ca3af]">No data for this period.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#eceef2] bg-white p-4">
      <h3 className="text-sm font-bold text-[#1a1f2e]">{title}</h3>
      {subtitle ? <p className="mt-0.5 text-xs text-[#9ca3af]">{subtitle}</p> : null}
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => {
          const width = Math.round((item.count / maxCount) * 100);
          return (
            <li key={item.key}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-[#1a1f2e]">{item.label}</span>
                <span className="tabular-nums text-[#6b7280]">
                  {item.count.toLocaleString("en-IN")} orders
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                <div
                  className="h-full rounded-full bg-[#16a34a]/80"
                  style={{ width: `${width}%` }}
                />
              </div>
              {showRevenue && item.revenue > 0 ? (
                <p className="mt-1 text-[10px] text-[#9ca3af]">
                  {formatAnalyticsInr(item.revenue)} revenue
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
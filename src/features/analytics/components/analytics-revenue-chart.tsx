"use client";

import type { MerchantAnalyticsDailyPoint } from "../types/merchant-analytics";
import { chartPointsFromSeries, formatAnalyticsInr } from "../utils/format-analytics";

type AnalyticsRevenueChartProps = {
  series: MerchantAnalyticsDailyPoint[];
  rangeLabel: string;
};

export function AnalyticsRevenueChart({
  series,
  rangeLabel,
}: AnalyticsRevenueChartProps) {
  const points = chartPointsFromSeries(series);
  const maxValue = Math.max(...points.map((p) => p.value), 0);
  const useBars = points.length > 14;
  const hasData = points.some((p) => p.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#e8eaef] bg-[#fafbfc] text-sm text-[#9ca3af]">
        No revenue in {rangeLabel.toLowerCase()}
      </div>
    );
  }

  if (useBars) {
    return (
      <div
        className="h-52 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="img"
        aria-label={`Revenue by day ${rangeLabel}`}
      >
        <div
          className="flex h-full min-w-full items-end gap-1 px-1 pb-6 pt-4"
          style={{ minWidth: `${Math.max(points.length * 14, 280)}px` }}
        >
          {points.map((point) => {
            const heightPct = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
            return (
              <div
                key={point.dateKey}
                className="group flex min-w-[10px] flex-1 flex-col items-center gap-1"
              >
                <div
                  className="w-full max-w-[18px] rounded-t-md bg-gradient-to-t from-[#16a34a] to-[#4ade80] transition group-hover:from-[#15803d]"
                  style={{ height: `${Math.max(heightPct, point.value > 0 ? 4 : 0)}%` }}
                  title={`${point.label}: ${formatAnalyticsInr(point.value)}`}
                />
                {points.length <= 31 ? (
                  <span className="text-[8px] text-[#9ca3af] [writing-mode:vertical-rl] rotate-180 max-h-8 truncate">
                    {point.label.replace(" ", "\u00a0")}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <AnalyticsAreaChart points={points} maxValue={maxValue} rangeLabel={rangeLabel} />;
}

function AnalyticsAreaChart({
  points,
  maxValue,
  rangeLabel,
}: {
  points: { label: string; value: number; dateKey: string }[];
  maxValue: number;
  rangeLabel: string;
}) {
  const W = 560;
  const H = 200;
  const PAD = { top: 16, right: 12, bottom: 28, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const denom = Math.max(points.length - 1, 1);
  const scaleMax = maxValue > 0 ? maxValue : 1;

  const path = points
    .map((point, i) => {
      const x = PAD.left + (i / denom) * innerW;
      const y = PAD.top + innerH - (point.value / scaleMax) * innerH;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const yBase = PAD.top + innerH;
  const area = `${path} L ${PAD.left + innerW} ${yBase} L ${PAD.left} ${yBase} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-48 w-full"
      role="img"
      aria-label={`Revenue trend ${rangeLabel}`}
    >
      <defs>
        <linearGradient id="analytics-revenue-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#analytics-revenue-area)" />
      <path
        d={path}
        fill="none"
        stroke="#16a34a"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point, i) => {
        const x = PAD.left + (i / denom) * innerW;
        return (
          <text
            key={point.dateKey}
            x={x}
            y={H - 6}
            textAnchor="middle"
            className="fill-[#9ca3af] text-[10px]"
          >
            {point.label}
          </text>
        );
      })}
    </svg>
  );
}
"use client";

import type { SalesChartPoint } from "../utils/dashboard-metrics";

const W = 560;
const H = 200;
const PAD = { top: 16, right: 12, bottom: 28, left: 44 };
const innerW = W - PAD.left - PAD.right;
const innerH = H - PAD.top - PAD.bottom;

function toPath(points: SalesChartPoint[], maxValue: number): string {
  if (points.length === 0) {
    return "";
  }
  const denom = Math.max(points.length - 1, 1);
  const scaleMax = maxValue > 0 ? maxValue : 1;

  return points
    .map((point, i) => {
      const x = PAD.left + (i / denom) * innerW;
      const y = PAD.top + innerH - (point.value / scaleMax) * innerH;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function toAreaPath(points: SalesChartPoint[], maxValue: number): string {
  if (points.length === 0) {
    return "";
  }
  const line = toPath(points, maxValue);
  const xEnd = PAD.left + innerW;
  const yBase = PAD.top + innerH;
  const xStart = PAD.left;
  return `${line} L ${xEnd} ${yBase} L ${xStart} ${yBase} Z`;
}

function formatAxisAmount(value: number): string {
  if (value >= 100_000) {
    return `${(value / 100_000).toFixed(value >= 1_000_000 ? 0 : 1)}L`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return String(Math.round(value));
}

type DashboardSalesChartProps = {
  points: SalesChartPoint[];
  rangeLabel: string;
};

export function DashboardSalesChart({ points, rangeLabel }: DashboardSalesChartProps) {
  const maxValue = Math.max(...points.map((p) => p.value), 0);
  const path = toPath(points, maxValue);
  const area = toAreaPath(points, maxValue);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const denom = Math.max(points.length - 1, 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      role="img"
      aria-label={`Sales trend ${rangeLabel}`}
    >
      <defs>
        <linearGradient id="sales-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {ticks.map((t) => {
        const y = PAD.top + innerH - t * innerH;
        const label = formatAxisAmount(maxValue * t);
        return (
          <g key={t}>
            <line
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="#eef0f4"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-[#9ca3af] text-[10px]"
            >
              {label}
            </text>
          </g>
        );
      })}

      {path ? (
        <>
          <path d={area} fill="url(#sales-area)" />
          <path
            d={path}
            fill="none"
            stroke="#16a34a"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <text
          x={W / 2}
          y={H / 2}
          textAnchor="middle"
          className="fill-[#9ca3af] text-[12px]"
        >
          No sales in this period
        </text>
      )}

      {points.map((point, i) => {
        const x = PAD.left + (i / denom) * innerW;
        const scaleMax = maxValue > 0 ? maxValue : 1;
        const y = PAD.top + innerH - (point.value / scaleMax) * innerH;
        const showDot = i === points.length - 1 && point.value > 0;
        return (
          <g key={point.dateKey}>
            {showDot ? (
              <circle cx={x} cy={y} r={5} fill="#16a34a" stroke="#fff" strokeWidth={2} />
            ) : null}
            <text
              x={x}
              y={H - 6}
              textAnchor="middle"
              className="fill-[#9ca3af] text-[10px]"
            >
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
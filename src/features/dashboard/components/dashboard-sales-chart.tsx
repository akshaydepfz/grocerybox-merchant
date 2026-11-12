"use client";

const POINTS = [
  { x: 0, y: 0.42 },
  { x: 1, y: 0.55 },
  { x: 2, y: 0.48 },
  { x: 3, y: 0.62 },
  { x: 4, y: 0.58 },
  { x: 5, y: 0.78 },
  { x: 6, y: 0.95 },
] as const;

const LABELS = ["Nov 6", "Nov 7", "Nov 8", "Nov 9", "Nov 10", "Nov 11", "Nov 12"];

const W = 560;
const H = 200;
const PAD = { top: 16, right: 12, bottom: 28, left: 44 };
const innerW = W - PAD.left - PAD.right;
const innerH = H - PAD.top - PAD.bottom;

function toPath(): string {
  return POINTS.map((p, i) => {
    const x = PAD.left + (p.x / 6) * innerW;
    const y = PAD.top + innerH - p.y * innerH;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
}

function toAreaPath(): string {
  const line = toPath();
  const xEnd = PAD.left + innerW;
  const yBase = PAD.top + innerH;
  const xStart = PAD.left;
  return `${line} L ${xEnd} ${yBase} L ${xStart} ${yBase} Z`;
}

export function DashboardSalesChart() {
  const path = toPath();
  const area = toAreaPath();

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      role="img"
      aria-label="Sales trend Nov 6 to Nov 12"
    >
      <defs>
        <linearGradient id="sales-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.top + innerH - t * innerH;
        const label = `${Math.round(t * 30)}K`;
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

      <path d={area} fill="url(#sales-area)" />
      <path
        d={path}
        fill="none"
        stroke="#16a34a"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {POINTS.map((p, i) => {
        const x = PAD.left + (p.x / 6) * innerW;
        const y = PAD.top + innerH - p.y * innerH;
        return (
          <circle
            key={LABELS[i]}
            cx={x}
            cy={y}
            r={i === POINTS.length - 1 ? 5 : 0}
            fill="#16a34a"
            stroke="#fff"
            strokeWidth={2}
          />
        );
      })}

      {LABELS.map((label, i) => {
        const x = PAD.left + (i / 6) * innerW;
        return (
          <text
            key={label}
            x={x}
            y={H - 6}
            textAnchor="middle"
            className="fill-[#9ca3af] text-[10px]"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

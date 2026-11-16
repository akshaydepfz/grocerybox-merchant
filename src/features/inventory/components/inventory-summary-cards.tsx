"use client";

import { AlertTriangle, CheckCircle2, Package, Warehouse, XCircle } from "lucide-react";

import type { MerchantInventorySummary } from "../types/merchant-inventory";
import { cn } from "@/lib/utils";

type InventorySummaryCardsProps = {
  summary: MerchantInventorySummary;
  activeFilter: string;
  onFilterSelect: (filter: string) => void;
};

const CARD_CONFIG = [
  {
    key: "all",
    label: "All SKUs",
    description: "Total catalogue items",
    icon: Package,
    tone: "neutral",
    countKey: "totalProducts" as const,
  },
  {
    key: "well_stocked",
    label: "Well stocked",
    description: "Above low-stock threshold",
    icon: CheckCircle2,
    tone: "success",
    countKey: "inStockCount" as const,
  },
  {
    key: "low_stock",
    label: "Low stock",
    description: "Needs restocking soon",
    icon: AlertTriangle,
    tone: "warning",
    countKey: "lowStockCount" as const,
  },
  {
    key: "out_of_stock",
    label: "Out of stock",
    description: "Unavailable to customers",
    icon: XCircle,
    tone: "danger",
    countKey: "outOfStockCount" as const,
  },
] as const;

const TONE_STYLES = {
  neutral: {
    ring: "ring-[#e8eaef]",
    active: "border-[#1a1f2e] bg-[#fafbfc]",
    icon: "bg-[#f3f4f6] text-[#4b5563]",
    count: "text-[#1a1f2e]",
  },
  success: {
    ring: "ring-[#bbf7d0]",
    active: "border-[#16a34a] bg-[#f0fdf4]",
    icon: "bg-[#dcfce7] text-[#15803d]",
    count: "text-[#15803d]",
  },
  warning: {
    ring: "ring-[#fed7aa]",
    active: "border-[#ea580c] bg-[#fff7ed]",
    icon: "bg-[#ffedd5] text-[#c2410c]",
    count: "text-[#c2410c]",
  },
  danger: {
    ring: "ring-[#fecaca]",
    active: "border-[#dc2626] bg-[#fef2f2]",
    icon: "bg-[#fee2e2] text-[#b91c1c]",
    count: "text-[#b91c1c]",
  },
} as const;

export function InventorySummaryCards({
  summary,
  activeFilter,
  onFilterSelect,
}: InventorySummaryCardsProps) {
  return (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon;
        const styles = TONE_STYLES[card.tone];
        const active = activeFilter === card.key;
        const count = summary[card.countKey];

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onFilterSelect(card.key)}
            className={cn(
              "flex flex-col gap-2 rounded-2xl border p-3 text-left transition active:scale-[0.99] sm:p-4",
              active
                ? cn(styles.active, "shadow-sm ring-2", styles.ring)
                : "border-[#eceef2] bg-white hover:border-[#d1d5db]",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-xl",
                  styles.icon,
                )}
              >
                <Icon className="size-4.5" aria-hidden />
              </span>
              {active ? (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#6b7280]">
                  Filter on
                </span>
              ) : null}
            </div>
            <div>
              <p
                className={cn(
                  "text-2xl font-bold tabular-nums tracking-tight",
                  styles.count,
                )}
              >
                {count.toLocaleString("en-IN")}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#1a1f2e]">
                {card.label}
              </p>
              <p className="mt-0.5 hidden text-[11px] text-[#9ca3af] sm:block">
                {card.description}
              </p>
            </div>
          </button>
        );
      })}

      <p className="col-span-2 flex items-center gap-2 rounded-xl border border-dashed border-[#e8eaef] bg-[#fafbfc] px-3 py-2 text-xs text-[#6b7280] sm:col-span-4">
        <Warehouse className="size-4 shrink-0 text-[#9ca3af]" aria-hidden />
        <span>
          {summary.totalUnits.toLocaleString("en-IN", {
            maximumFractionDigits: 1,
          })}{" "}
          total units on hand · Low-stock alert at{" "}
          {summary.lowStockThreshold.toLocaleString("en-IN")} units or below
        </span>
      </p>
    </div>
  );
}
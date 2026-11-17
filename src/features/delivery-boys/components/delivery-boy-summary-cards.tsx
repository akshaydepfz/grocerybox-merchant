"use client";

import { PackageCheck, Truck, UserCheck, UserX } from "lucide-react";

import type { MerchantDeliveryBoySummary } from "../types/merchant-delivery-boy";
import { cn } from "@/lib/utils";

type DeliveryBoySummaryCardsProps = {
  summary: MerchantDeliveryBoySummary | null;
  loading?: boolean;
};

const CARD_CONFIG = [
  {
    key: "total",
    label: "Total Delivery Boys",
    valueKey: "total" as const,
    icon: Truck,
    tone: "neutral" as const,
    hint: "Registered partners",
  },
  {
    key: "active",
    label: "Active",
    valueKey: "active" as const,
    icon: UserCheck,
    tone: "success" as const,
    hint: "Available for assignments",
  },
  {
    key: "inactive",
    label: "Inactive",
    valueKey: "inactive" as const,
    icon: UserX,
    tone: "muted" as const,
    hint: "Paused or off duty",
  },
  {
    key: "deliveries",
    label: "Total Deliveries",
    valueKey: "totalDeliveries" as const,
    icon: PackageCheck,
    tone: "accent" as const,
    hint: "Completed across the team",
  },
] as const;

const TONE = {
  neutral: {
    card: "border-[#eceef2] bg-white",
    icon: "bg-[#f3f4f6] text-[#4b5563]",
    value: "text-[#1a1f2e]",
  },
  success: {
    card: "border-[#bbf7d0] bg-gradient-to-br from-[#f0fdf4] to-white",
    icon: "bg-[#dcfce7] text-[#15803d]",
    value: "text-[#15803d]",
  },
  muted: {
    card: "border-[#e5e7eb] bg-gradient-to-br from-[#f9fafb] to-white",
    icon: "bg-[#f3f4f6] text-[#6b7280]",
    value: "text-[#6b7280]",
  },
  accent: {
    card: "border-[#bbf7d0] bg-gradient-to-br from-[#ecfdf5] to-white",
    icon: "bg-[#dcfce7] text-[#16a34a]",
    value: "text-[#16a34a]",
  },
} as const;

export function DeliveryBoySummaryCards({
  summary,
  loading,
}: DeliveryBoySummaryCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon;
        const styles = TONE[card.tone];
        const value = summary ? summary[card.valueKey] : null;
        return (
          <article
            key={card.key}
            className={cn(
              "flex flex-col gap-2 rounded-2xl border p-3 sm:p-4",
              styles.card,
            )}
          >
            <span
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-xl",
                styles.icon,
              )}
            >
              <Icon className="size-4.5" aria-hidden />
            </span>
            <div>
              <p
                className={cn(
                  "text-2xl font-bold tabular-nums tracking-tight",
                  styles.value,
                )}
              >
                {loading || value == null ? "—" : value.toLocaleString("en-IN")}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[#1a1f2e]">
                {card.label}
              </p>
              <p className="mt-0.5 hidden text-[11px] text-[#9ca3af] sm:block">
                {card.hint}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
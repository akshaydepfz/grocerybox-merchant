"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { MerchantProductUnit } from "../types/merchant-product";
import { formatProductUnitLabel } from "../utils/format-product";

export const UNIT_OPTIONS: { value: MerchantProductUnit; label: string }[] = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "litre", label: "Litre" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "piece", label: "Piece" },
  { value: "pack", label: "Pack" },
  { value: "dozen", label: "Dozen" },
  { value: "box", label: "Box" },
];

export const selectClassName =
  "h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30 disabled:cursor-not-allowed disabled:opacity-60";

export function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[#1a1f2e]">{title}</h2>
      <p className="mt-0.5 text-xs text-[#9ca3af]">{description}</p>
    </div>
  );
}

export function Field({
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-[#1a1f2e]">
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </span>
      {children}
      {hint ? <span className="text-xs text-[#9ca3af]">{hint}</span> : null}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function formatUnitHint(unit: MerchantProductUnit | ""): string {
  return unit ? formatProductUnitLabel(unit as MerchantProductUnit) : "units";
}

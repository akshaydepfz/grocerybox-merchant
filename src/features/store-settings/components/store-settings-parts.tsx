"use client";

import { AlertTriangle, IndianRupee, Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function StoreSettingsAlert({
  variant,
  message,
}: {
  variant: "warning" | "info";
  message: string;
}) {
  const isWarning = variant === "warning";
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        isWarning
          ? "border-[#fde68a] bg-[#fffbeb] text-[#92400e]"
          : "border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af]",
      )}
      role="status"
    >
      {isWarning ? (
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      ) : (
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      <p className="leading-snug">{message}</p>
    </div>
  );
}

export function StoreSettingsNumericField({
  label,
  value,
  disabled,
  icon: Icon,
  rupeePrefix,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  icon: LucideIcon;
  rupeePrefix?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
        {label}
      </label>
      <div className="relative mt-1.5">
        {rupeePrefix ? (
          <IndianRupee
            className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#6b7280]"
            aria-hidden
          />
        ) : (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-[#6b7280]"
            aria-hidden
          />
        )}
        <Input
          value={value}
          readOnly={disabled}
          inputMode="decimal"
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-11 rounded-xl border-[#e8eaef] bg-[#fafbfc] pl-9 text-sm font-medium text-[#1a1f2e]",
            disabled && "opacity-70",
          )}
        />
      </div>
    </div>
  );
}

export function StoreSettingsToggleGrid({
  twoCol,
  children,
}: {
  twoCol: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        twoCol ? "grid grid-cols-2 gap-3.5" : "flex flex-col gap-3.5",
      )}
    >
      {children}
    </div>
  );
}

"use client";

import type { DeliveryBoyCommissionType } from "../types/merchant-delivery-boy";
import { commissionPreviewText } from "../utils/format-delivery-boy";
import { cn } from "@/lib/utils";

const inputClassName =
  "h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30";

type CommissionSettingsProps = {
  commissionType: DeliveryBoyCommissionType;
  commissionValue: string;
  onTypeChange: (type: DeliveryBoyCommissionType) => void;
  onValueChange: (value: string) => void;
};

export function CommissionSettings({
  commissionType,
  commissionValue,
  onTypeChange,
  onValueChange,
}: CommissionSettingsProps) {
  const preview = commissionPreviewText(commissionType, commissionValue);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-[#1a1f2e]">Delivery Commission</h3>
        <p className="mt-1 text-xs text-[#9ca3af]">
          Configure how much this delivery partner earns for each completed
          delivery.
        </p>
      </div>

      <fieldset className="grid gap-3">
        <legend className="sr-only">Commission type</legend>
        <CommissionTypeOption
          checked={commissionType === "fixed"}
          name="commission-type"
          value="fixed"
          title="Fixed Amount Per Delivery"
          description="Example: ₹25 per completed delivery"
          onChange={() => onTypeChange("fixed")}
        />
        <CommissionTypeOption
          checked={commissionType === "percentage"}
          name="commission-type"
          value="percentage"
          title="Percentage Per Delivery"
          description="Example: 5% of eligible delivery charges"
          onChange={() => onTypeChange("percentage")}
        />
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
          {commissionType === "fixed"
            ? "Commission amount (₹)"
            : "Commission percentage (%)"}
        </span>
        <div className="relative">
          {commissionType === "fixed" ? (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6b7280]">
              ₹
            </span>
          ) : null}
          <input
            required
            inputMode="decimal"
            value={commissionValue}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={commissionType === "fixed" ? "25" : "5"}
            className={cn(
              inputClassName,
              commissionType === "fixed" ? "pl-8" : "pr-8",
            )}
          />
          {commissionType === "percentage" ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6b7280]">
              %
            </span>
          ) : null}
        </div>
      </label>

      <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#15803d]">
          Commission Preview
        </p>
        <p className="mt-1 text-sm font-medium text-[#1a1f2e]">{preview}</p>
      </div>
    </div>
  );
}

function CommissionTypeOption({
  checked,
  name,
  value,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  name: string;
  value: string;
  title: string;
  description: string;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition",
        checked
          ? "border-[#16a34a] bg-[#f0fdf4] ring-2 ring-[#bbf7d0]"
          : "border-[#e8eaef] bg-[#fafbfc] hover:border-[#d1d5db]",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-4 accent-[#16a34a]"
      />
      <span>
        <span className="block text-sm font-semibold text-[#1a1f2e]">{title}</span>
        <span className="mt-0.5 block text-xs text-[#9ca3af]">{description}</span>
      </span>
    </label>
  );
}
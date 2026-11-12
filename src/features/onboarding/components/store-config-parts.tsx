"use client";

import {
  CreditCard,
  FileText,
  Globe,
  Home,
  IndianRupee,
  MapPin,
  MessageCircle,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { MerchantFieldLabel, MerchantIconSelect } from "./merchant-form-fields";

const BRAND_GREEN = "#1BA63A";
const SECTION_BG = "#F8FCF6";
const SECTION_BORDER = "#E3EFE0";

export function StoreConfigSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: SECTION_BG,
        borderColor: `${SECTION_BORDER}cc`,
      }}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-gb-mo-gray-800" />
        <p className="text-base font-bold text-gb-mo-gray-900">{title}</p>
      </div>
      <p className="mt-1 mb-4 pl-7 text-xs text-gb-mo-gray-500">{subtitle}</p>
      {children}
    </div>
  );
}

export function OrderOptionCard({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
  selected,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
  selected: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      role="group"
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && onChange(!selected)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border bg-white p-4 text-left transition",
        selected ? "border-2" : "border border-gb-mo-gray-200",
        disabled ? "opacity-60" : "cursor-pointer",
      )}
      style={selected ? { borderColor: BRAND_GREEN } : undefined}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBackground }}
      >
        <Icon className="size-[22px]" style={{ color: iconColor }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-gb-mo-gray-900">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-snug text-gb-mo-gray-500">
          {description}
        </span>
      </span>
      <Checkbox
        checked={selected}
        disabled={disabled}
        onCheckedChange={(checked) => onChange(checked === true)}
        className="mt-0.5 border-gb-mo-gray-300 data-[state=checked]:border-[#1BA63A] data-[state=checked]:bg-[#1BA63A]"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export function ToggleSettingCard({
  title,
  description,
  icon: Icon,
  value,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-gb-mo-gray-200 bg-white p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gb-mo-gray-100/80">
        <Icon className="size-5 text-gb-mo-gray-700" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-gb-mo-gray-900">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-snug text-gb-mo-gray-500">
          {description}
        </span>
      </span>
      <Switch
        checked={value}
        disabled={disabled}
        onCheckedChange={onChange}
        className="mt-1 data-[state=checked]:bg-[#1BA63A]"
      />
    </div>
  );
}

export function DeliveryRadiusField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <MerchantFieldLabel label="Delivery Radius (km)" required />
      <MerchantIconSelect
        icon={MapPin}
        value={value}
        onValueChange={onChange}
        items={["5 km", "10 km", "15 km", "20 km"].map((item) => ({
          value: item,
          label: item,
        }))}
      />
    </div>
  );
}

export function MinimumOrderValueField({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <MerchantFieldLabel label="Minimum Order Value (₹)" required />
      <div className="relative">
        <IndianRupee className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-gb-mo-gray-600" />
        <Input
          value={value}
          readOnly={disabled}
          inputMode="numeric"
          onChange={(e) => onChange(e.target.value)}
          className="h-auto rounded-lg border-gb-mo-input-border bg-white py-3 pl-9 text-sm font-semibold text-gb-mo-gray-800"
        />
      </div>
    </div>
  );
}

export function PaymentOptionTile({
  label,
  leading,
  value,
  disabled,
  onChange,
}: {
  label: string;
  leading: ReactNode;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      role="group"
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && onChange(!value)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-gb-mo-gray-200 bg-white px-3.5 py-3 text-left",
        disabled ? "opacity-60" : "cursor-pointer",
      )}
    >
      {leading}
      <span className="min-w-0 flex-1 text-sm font-medium text-gb-mo-gray-800">
        {label}
      </span>
      <Checkbox
        checked={value}
        disabled={disabled}
        onCheckedChange={(checked) => onChange(checked === true)}
        className="data-[state=checked]:border-[#1BA63A] data-[state=checked]:bg-[#1BA63A]"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export function UpiBadge() {
  return (
    <span className="rounded border border-gb-mo-gray-100 bg-gb-mo-gray-100 px-2 py-1 text-xs font-extrabold italic text-gb-mo-gray-900">
      UP<span className="text-gb-mo-brand-dark">I</span>
    </span>
  );
}

export function CodLeadingIcon() {
  return (
    <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50">
      <CreditCard className="size-5 text-emerald-600" />
    </span>
  );
}

export const StoreConfigSectionIcons = {
  orders: FileText,
  delivery: Truck,
  payment: CreditCard,
  whatsApp: MessageCircle,
  website: Globe,
  homeDelivery: Home,
  storePickup: Store,
};

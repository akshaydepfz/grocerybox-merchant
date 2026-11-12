"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const fieldBase =
  "h-auto rounded-lg border-gb-mo-input-border text-xs text-gb-mo-gray-800 shadow-none focus-visible:border-gb-mo-focus-ring focus-visible:ring-[1.5px] focus-visible:ring-gb-mo-focus-ring/40";

export function MerchantFieldLabel({
  label,
  required,
  optional,
  compact,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  compact?: boolean;
}) {
  return (
    <p
      className={cn(
        "pb-1.5 font-semibold text-gb-mo-gray-800",
        compact ? "text-[11px] text-gb-mo-gray-700" : "text-xs",
      )}
    >
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
      {optional ? (
        <span className="font-normal text-gb-mo-gray-400"> (Optional)</span>
      ) : null}
    </p>
  );
}

export function MerchantIconTextField({
  icon: Icon,
  dense,
  readOnly,
  filledBackground,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  icon: LucideIcon;
  dense?: boolean;
  filledBackground?: boolean;
}) {
  return (
    <FieldWrapper>
      <Icon
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-gb-mo-gray-400",
          dense ? "size-3.5" : "size-4",
        )}
      />
      <Input
        {...props}
        readOnly={readOnly}
        className={cn(
          fieldBase,
          "pl-9",
          dense ? "py-2.5 text-xs" : "py-3 text-xs",
          readOnly || filledBackground
            ? "bg-gb-mo-gray-100 font-medium text-gb-mo-gray-700"
            : "bg-white",
          className,
        )}
      />
    </FieldWrapper>
  );
}

function FieldWrapper({ children }: { children: ReactNode }) {
  return <div className="relative">{children}</div>;
}

type MerchantSelectProps = {
  icon: LucideIcon;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  items: { value: string; label: string }[];
  dense?: boolean;
};

export function MerchantIconSelect({
  icon: Icon,
  value,
  onValueChange,
  placeholder,
  items,
  dense,
}: MerchantSelectProps) {
  return (
    <FieldWrapper>
      <Icon
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-gb-mo-gray-400",
          dense ? "size-3.5" : "size-4",
        )}
      />
      <Select
        value={value.length > 0 ? value : undefined}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          className={cn(
            fieldBase,
            "h-auto w-full justify-between pl-9",
            dense ? "py-2.5" : "py-3",
            !value && "text-gb-mo-gray-500",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} className="text-xs">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
      </Select>
    </FieldWrapper>
  );
}

export function MerchantCompactSelect({
  label,
  required,
  value,
  onValueChange,
  items,
}: {
  label: string;
  required?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  items: readonly string[];
}) {
  return (
    <div>
      <MerchantFieldLabel label={label} required={required} compact />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            fieldBase,
            "h-auto w-full py-2.5 font-medium",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item} value={item} className="text-xs font-medium">
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function MerchantFieldBlock({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <FieldBlock>
      <MerchantFieldLabel
        label={label}
        required={required}
        optional={optional}
      />
      {children}
    </FieldBlock>
  );
}

function FieldBlock({ children }: { children: ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}

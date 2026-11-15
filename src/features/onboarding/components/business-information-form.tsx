"use client";

import type { ReactNode } from "react";
import { ChevronDown, FileText, Mail, Phone, Store, Tag, UserRound } from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";

import { BUSINESS_TYPE_OPTIONS } from "../constants";
import type { BusinessInformationFormValues } from "../types/business-information";

import {
  MerchantFieldBlock,
  MerchantIconSelect,
  MerchantIconTextField,
} from "./merchant-form-fields";

type BusinessInformationFormProps = {
  values: BusinessInformationFormValues;
  onChange: (patch: Partial<BusinessInformationFormValues>) => void;
};

export function BusinessInformationForm({
  values,
  onChange,
}: BusinessInformationFormProps) {
  const twoCol = useMediaQuery("(min-width: 640px)");

  return (
    <div className="space-y-4">
      <FormRow twoColumn={twoCol}>
        <MerchantFieldBlock label="Business Name" required>
          <MerchantIconTextField
            icon={Store}
            value={values.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
            placeholder="e.g. Fresh Mart"
          />
        </MerchantFieldBlock>
        <MerchantFieldBlock label="Business Type" required>
          <MerchantIconSelect
            icon={Tag}
            value={values.businessType ?? ""}
            onValueChange={(businessType) => onChange({ businessType })}
            placeholder="Select business type"
            items={[...BUSINESS_TYPE_OPTIONS]}
          />
        </MerchantFieldBlock>
      </FormRow>

      <FormRow twoColumn={twoCol}>
        <MerchantFieldBlock label="Owner Full Name" required>
          <MerchantIconTextField
            icon={UserRound}
            value={values.ownerFullName}
            onChange={(e) => onChange({ ownerFullName: e.target.value })}
            placeholder="e.g. Akshay P K"
          />
        </MerchantFieldBlock>
        <MerchantFieldBlock label="Mobile Number" required>
          <MobileNumberField
            value={values.mobileNumber}
            onChange={(mobileNumber) => onChange({ mobileNumber })}
          />
        </MerchantFieldBlock>
      </FormRow>

      <MerchantFieldBlock label="Email Address" required>
        <MerchantIconTextField
          icon={Mail}
          value={values.email}
          readOnly
          filledBackground
        />
      </MerchantFieldBlock>

      <MerchantFieldBlock label="GSTIN" optional>
        <MerchantIconTextField
          icon={FileText}
          value={values.gstin}
          onChange={(e) => onChange({ gstin: e.target.value.toUpperCase() })}
          placeholder="e.g. 32ABCDE1234F1Z5"
        />
      </MerchantFieldBlock>
    </div>
  );
}

function FormRow({
  twoColumn,
  children,
}: {
  twoColumn: boolean;
  children: ReactNode;
}) {
  if (!twoColumn) {
    return <FormRowStack className="space-y-4">{children}</FormRowStack>;
  }
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function FormRowStack({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function MobileNumberField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-h-11 overflow-hidden rounded-lg border border-gb-mo-input-border bg-white">
      <MobilePrefix className="flex shrink-0 items-center gap-1.5 border-r border-gb-mo-gray-200 px-2.5 py-3 sm:gap-2 sm:px-3">
        <Phone className="size-3.5 text-gb-mo-gray-400" aria-hidden />
        <span className="text-xs font-medium text-gb-mo-gray-700">+91</span>
        <ChevronDown
          className="hidden size-3.5 text-gb-mo-gray-400 sm:block"
          aria-hidden
        />
      </MobilePrefix>
      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Mobile number"
        className="min-w-0 flex-1 px-3 py-3 text-base text-gb-mo-gray-800 outline-none placeholder:font-normal placeholder:text-gb-mo-gray-300 sm:text-xs"
      />
    </div>
  );
}

function MobilePrefix({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
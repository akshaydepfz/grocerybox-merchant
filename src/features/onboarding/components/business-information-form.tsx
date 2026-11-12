"use client";

import type { ReactNode } from "react";
import {
  Building2,
  ChevronDown,
  FileText,
  LocateFixed,
  Mail,
  MapPin,
  Phone,
  Store,
  Tag,
  UserRound,
} from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import {
  BUSINESS_TYPE_OPTIONS,
  CITY_OPTIONS,
  DISTRICT_OPTIONS,
  STATE_OPTIONS,
} from "../constants";
import type { BusinessInformationFormValues } from "../types/business-information";

import {
  MerchantCompactSelect,
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
  const addressCols = useMediaQuery("(min-width: 520px)");

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

      <AddressSection
        twoColumn={twoCol}
        addressCols={addressCols}
        values={values}
        onChange={onChange}
      />
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

function FormRowStack({ children, className }: { children: React.ReactNode; className?: string }) {
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
    <div className="flex overflow-hidden rounded-lg border border-gb-mo-input-border bg-white">
      <MobilePrefix className="flex items-center gap-2 border-r border-gb-mo-gray-200 px-3 py-3">
        <Phone className="size-3.5 text-gb-mo-gray-400" />
        <span className="text-xs font-medium text-gb-mo-gray-700">+91</span>
        <ChevronDown className="size-3.5 text-gb-mo-gray-400" />
      </MobilePrefix>
      <input
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter mobile number"
        className="min-w-0 flex-1 px-3 py-3 text-xs text-gb-mo-gray-800 outline-none placeholder:text-gb-mo-gray-400"
      />
    </div>
  );
}

function MobilePrefix({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function AddressSection({
  twoColumn,
  addressCols,
  values,
  onChange,
}: {
  twoColumn: boolean;
  addressCols: boolean;
  values: BusinessInformationFormValues;
  onChange: (patch: Partial<BusinessInformationFormValues>) => void;
}) {
  return (
    <div className="rounded-xl border border-gb-mo-address-border bg-gb-mo-address-bg p-4">
      <p className="text-xs font-bold text-gb-mo-gray-900">Business Address</p>
      <div className="mt-3.5 space-y-3.5">
        <FormRow twoColumn={twoColumn}>
          <MerchantFieldBlock label="Address Line 1" required>
            <MerchantIconTextField
              icon={MapPin}
              dense
              value={values.addressLine1}
              onChange={(e) => onChange({ addressLine1: e.target.value })}
              placeholder="House / Building / Street"
            />
          </MerchantFieldBlock>
          <MerchantFieldBlock label="Address Line 2" optional>
            <MerchantIconTextField
              icon={Building2}
              dense
              value={values.addressLine2}
              onChange={(e) => onChange({ addressLine2: e.target.value })}
              placeholder="Area / Landmark"
            />
          </MerchantFieldBlock>
        </FormRow>

        <div
          className={cn(
            "gap-3",
            addressCols ? "grid grid-cols-4" : "grid grid-cols-2",
          )}
        >
          <MerchantCompactSelect
            label="State"
            required
            value={values.state}
            onValueChange={(state) => onChange({ state })}
            items={STATE_OPTIONS}
          />
          <MerchantCompactSelect
            label="District"
            required
            value={values.district}
            onValueChange={(district) => onChange({ district })}
            items={DISTRICT_OPTIONS}
          />
          <MerchantCompactSelect
            label="City / Town"
            required
            value={values.city}
            onValueChange={(city) => onChange({ city })}
            items={CITY_OPTIONS}
          />
          <MerchantFieldBlock label="PIN Code" required>
            <MerchantIconTextField
              icon={LocateFixed}
              dense
              inputMode="numeric"
              value={values.pinCode}
              onChange={(e) => onChange({ pinCode: e.target.value })}
            />
          </MerchantFieldBlock>
        </div>
      </div>
    </div>
  );
}

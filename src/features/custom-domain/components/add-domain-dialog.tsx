"use client";

import { Loader2, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { MerchantDomainType } from "../types/merchant-domain";
import {
  normalizeDomainHostname,
  validateDomainHostname,
} from "../validators/domain-hostname-validator";
import {
  DELIVERY_DOMAIN_EXAMPLE,
  STOREFRONT_DOMAIN_EXAMPLE,
} from "../utils/format-domain";

type AddDomainDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDomainType?: MerchantDomainType;
  formSession: number;
  isSubmitting: boolean;
  onSubmit: (input: { domain: string; domainType: MerchantDomainType }) => Promise<void>;
};

export function AddDomainDialog({
  open,
  onOpenChange,
  initialDomainType = "storefront",
  formSession,
  isSubmitting,
  onSubmit,
}: AddDomainDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl border-[#eceef2] p-0 sm:max-w-lg">
        {open ? (
          <AddDomainDialogForm
            key={`${initialDomainType}-${formSession}`}
            initialDomainType={initialDomainType}
            isSubmitting={isSubmitting}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type AddDomainDialogFormProps = {
  initialDomainType: MerchantDomainType;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: { domain: string; domainType: MerchantDomainType }) => Promise<void>;
};

function AddDomainDialogForm({
  initialDomainType,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AddDomainDialogFormProps) {
  const [domainInput, setDomainInput] = useState("");
  const [domainType, setDomainType] =
    useState<MerchantDomainType>(initialDomainType);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const example =
    domainType === "delivery"
      ? DELIVERY_DOMAIN_EXAMPLE
      : STOREFRONT_DOMAIN_EXAMPLE;

  const handleSubmit = async () => {
    const validationError = validateDomainHostname(domainInput);
    if (validationError) {
      setFieldError(validationError);
      return;
    }
    const domain = normalizeDomainHostname(domainInput);
    if (!domain) {
      setFieldError("Domain name is required.");
      return;
    }

    setFieldError(null);
    try {
      await onSubmit({ domain, domainType });
      toast.success("Domain added. Follow the DNS instructions to verify.");
      onOpenChange(false);
    } catch {
      // Caller surfaces API errors.
    }
  };

  return (
    <>
        <DialogHeader className="border-b border-[#f0f1f4] px-5 py-4 text-left">
          <DialogTitle className="text-lg font-bold text-[#1a1f2e]">
            Add domain
          </DialogTitle>
          <DialogDescription className="text-sm text-[#6b7280]">
            Register a custom hostname for your storefront or delivery portal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 py-4">
          <DomainTypeField
            value={domainType}
            onChange={setDomainType}
            disabled={isSubmitting}
          />

          <FormField
            label="Domain name"
            hint={`Example: ${example}`}
            error={fieldError}
          >
            <Input
              value={domainInput}
              onChange={(event) => {
                setDomainInput(event.target.value);
                if (fieldError) {
                  setFieldError(null);
                }
              }}
              placeholder={example}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={isSubmitting}
              className="h-11 rounded-xl border-[#eceef2] font-mono text-sm"
              aria-invalid={fieldError ? true : undefined}
            />
          </FormField>
        </div>

        <DialogFooter className="border-t border-[#f0f1f4] bg-[#fafbfc] px-5 py-4 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-11 rounded-xl bg-[#16a34a] text-white hover:bg-[#15803d]"
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
            Add domain
          </Button>
        </DialogFooter>
    </>
  );
}

function DomainTypeOption({
  active,
  title,
  description,
  onClick,
  disabled,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col rounded-xl border px-3 py-3 text-left transition-colors",
        active
          ? "border-[#16a34a] bg-[#f0fdf4] ring-1 ring-[#bbf7d0]"
          : "border-[#eceef2] bg-white hover:bg-[#fafbfc]",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <span className="text-sm font-semibold text-[#1a1f2e]">{title}</span>
      <span className="mt-1 text-xs text-[#6b7280]">{description}</span>
    </button>
  );
}

function DomainTypeField({
  value,
  onChange,
  disabled,
}: {
  value: MerchantDomainType;
  onChange: (next: MerchantDomainType) => void;
  disabled?: boolean;
}) {
  return (
    <FormField label="Domain type" hint="Choose where this hostname will be used.">
      <div className="flex flex-col gap-2 sm:flex-row">
        <DomainTypeOption
          active={value === "storefront"}
          title="Storefront"
          description="Customer website for browsing and orders"
          disabled={disabled}
          onClick={() => onChange("storefront")}
        />
        <DomainTypeOption
          active={value === "delivery"}
          title="Delivery"
          description="Branded portal for delivery partners"
          disabled={disabled}
          onClick={() => onChange("delivery")}
        />
      </div>
    </FormField>
  );
}

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-semibold text-[#1a1f2e]">{label}</span>
      {children}
      {error ? (
        <p className="text-xs font-medium text-[#b91c1c]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[#6b7280]">{hint}</p>
      ) : null}
    </div>
  );
}
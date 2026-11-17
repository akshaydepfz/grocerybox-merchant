"use client";

import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { dashboardRoutePrefix } from "@/config/routes";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  createMerchantDeliveryBoy,
  friendlyDeliveryBoyError,
  updateMerchantDeliveryBoy,
} from "../services";
import type {
  DeliveryBoyCommissionType,
  MerchantDeliveryBoy,
} from "../types/merchant-delivery-boy";
import { INDIAN_MOBILE_PATTERN } from "../utils/format-delivery-boy";

import { CommissionSettings } from "./commission-settings";

const listHref = `${dashboardRoutePrefix}/delivery-boys`;

const inputClassName =
  "h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30";

type DeliveryBoyFormProps =
  | { mode: "create" }
  | { mode: "edit"; partner: MerchantDeliveryBoy };

export function DeliveryBoyForm(props: DeliveryBoyFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = props.mode === "edit";
  const partner = isEdit ? props.partner : null;

  const [fullName, setFullName] = useState(partner?.fullName ?? "");
  const [phone, setPhone] = useState(partner?.phone ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [commissionType, setCommissionType] = useState<DeliveryBoyCommissionType>(
    partner?.commissionType ?? "fixed",
  );
  const [commissionValue, setCommissionValue] = useState(
    partner ? String(partner.commissionValue) : "25",
  );
  const [isActive, setIsActive] = useState(partner?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  const onSubmit = async () => {
    const trimmedName = fullName.trim();
    const digits = phone.replace(/\D/g, "");

    if (!trimmedName) {
      toast.error("Enter the delivery partner's full name.");
      return;
    }
    if (!INDIAN_MOBILE_PATTERN.test(digits)) {
      toast.error("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!isEdit) {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    } else if (password || confirmPassword) {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    const commissionNumber = Number.parseFloat(commissionValue.trim());
    if (!Number.isFinite(commissionNumber) || commissionNumber <= 0) {
      toast.error("Enter a valid commission value.");
      return;
    }
    if (commissionType === "percentage" && commissionNumber > 100) {
      toast.error("Commission percentage must be between 0 and 100.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && partner) {
        await updateMerchantDeliveryBoy(partner.id, {
          fullName: trimmedName,
          phone: digits,
          password: password.trim() || undefined,
          commissionType,
          commissionValue: commissionNumber,
          isActive,
        });
        toast.success("Delivery partner updated");
      } else {
        await createMerchantDeliveryBoy({
          fullName: trimmedName,
          phone: digits,
          password,
          commissionType,
          commissionValue: commissionNumber,
          isActive,
        });
        toast.success("Delivery partner created");
      }
      await queryClient.invalidateQueries({ queryKey: ["merchant-delivery-boys"] });
      await queryClient.invalidateQueries({
        queryKey: ["merchant-delivery-boys-summary"],
      });
      if (isEdit && partner) {
        await queryClient.invalidateQueries({
          queryKey: ["merchant-delivery-boy", partner.id],
        });
      }
      router.push(listHref);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? friendlyDeliveryBoyError(error)
          : "Unable to save delivery partner.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <DashboardSurface className="overflow-hidden">
        <SectionHeader
          title="Personal Information"
          description="Basic contact details for this delivery partner."
        />
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <Field label="Full Name" className="sm:col-span-2">
            <input
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter delivery boy name"
              className={inputClassName}
              autoComplete="name"
            />
          </Field>
          <Field label="Phone Number" className="sm:col-span-2">
            <input
              required
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="Enter 10-digit mobile number"
              className={inputClassName}
              autoComplete="tel"
            />
          </Field>
        </div>
      </DashboardSurface>

      <DashboardSurface className="overflow-hidden">
        <SectionHeader
          title="Login Credentials"
          description={
            isEdit
              ? "Leave blank to keep the current password."
              : "Used to sign in at delivery.grocerybox.in"
          }
        />
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <Field label={isEdit ? "New Password (optional)" : "Password"}>
            <PasswordField
              value={password}
              onChange={setPassword}
              placeholder={isEdit ? "Leave blank to keep current" : "Create password"}
              visible={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
              required={!isEdit}
            />
          </Field>
          <Field
            label={isEdit ? "Confirm New Password" : "Confirm Password"}
          >
            <PasswordField
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder={isEdit ? "Re-enter new password" : "Re-enter password"}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((value) => !value)}
              required={!isEdit}
            />
          </Field>
          <div className="sm:col-span-2">
            <p className="flex gap-2 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-4 py-3 text-xs leading-relaxed text-[#6b7280]">
              <Shield className="mt-0.5 size-4 shrink-0 text-[#16a34a]" aria-hidden />
              The delivery partner will use their registered phone number and
              password to sign in at delivery.grocerybox.in.
            </p>
          </div>
        </div>
      </DashboardSurface>

      <DashboardSurface className="overflow-hidden">
        <div className="border-b border-[#f0f1f4] bg-gradient-to-r from-[#f0fdf4] to-white px-5 py-4">
          <h2 className="text-base font-semibold text-[#1a1f2e]">
            Commission Settings
          </h2>
        </div>
        <div className="p-5">
          <CommissionSettings
            commissionType={commissionType}
            commissionValue={commissionValue}
            onTypeChange={setCommissionType}
            onValueChange={setCommissionValue}
          />
        </div>
      </DashboardSurface>

      <DashboardSurface className="overflow-hidden">
        <SectionHeader
          title="Account Status"
          description="Control whether this partner can receive new assignments."
        />
        <div className="p-5">
          <label className="flex items-center justify-between gap-4 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#1a1f2e]">Active</p>
              <p className="text-xs text-[#9ca3af]">
                Inactive delivery partners cannot receive new delivery
                assignments.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              aria-label="Delivery partner active status"
            />
          </label>
        </div>
      </DashboardSurface>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          asChild
        >
          <Link href={listHref}>Cancel</Link>
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="h-10 rounded-xl bg-[#16a34a] px-6 text-white hover:bg-[#15803d]"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {isEdit ? "Saving…" : "Creating…"}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Delivery Boy"
          )}
        </Button>
      </div>
    </form>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[#f0f1f4] bg-gradient-to-r from-[#f0fdf4] to-white px-5 py-4">
      <h2 className="text-base font-semibold text-[#1a1f2e]">{title}</h2>
      <p className="mt-0.5 text-xs text-[#9ca3af]">{description}</p>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
        {label}
      </span>
      {children}
    </label>
  );
}

function PasswordField({
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <input
        required={required}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        minLength={required ? 8 : undefined}
        className={cn(inputClassName, "pr-10")}
        autoComplete="new-password"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1f2e]"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
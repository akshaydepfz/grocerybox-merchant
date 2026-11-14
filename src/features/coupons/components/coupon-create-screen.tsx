"use client";

import { ArrowLeft, Loader2, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { dashboardRoutePrefix } from "@/config/routes";
import { cn } from "@/lib/utils";

import { useMerchantCoupons } from "../hooks/use-merchant-coupons";
import type { CouponDiscountType } from "../types/merchant-coupon";

const listHref = `${dashboardRoutePrefix}/coupons`;

const inputClassName =
  "h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30";

export function CouponCreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addCoupon, hydrated } = useMerchantCoupons();

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<CouponDiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const onCreate = () => {
    const trimmedCode = code.trim().toUpperCase();
    const trimmedTitle = title.trim();
    const value = Number.parseFloat(discountValue);

    if (!trimmedCode || trimmedCode.length < 3) {
      toast.error("Coupon code must be at least 3 characters.");
      return;
    }
    if (!trimmedTitle) {
      toast.error("Enter a short name for this coupon.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a valid discount value.");
      return;
    }
    if (discountType === "percent" && value > 100) {
      toast.error("Percentage cannot exceed 100.");
      return;
    }

    const minOrder = minOrderAmount.trim()
      ? Number.parseFloat(minOrderAmount)
      : undefined;
    if (minOrder != null && (!Number.isFinite(minOrder) || minOrder < 0)) {
      toast.error("Minimum order must be a valid amount.");
      return;
    }

    const maxDiscount = maxDiscountAmount.trim()
      ? Number.parseFloat(maxDiscountAmount)
      : undefined;
    if (
      maxDiscount != null &&
      (!Number.isFinite(maxDiscount) || maxDiscount < 0)
    ) {
      toast.error("Max discount must be a valid amount.");
      return;
    }

    const limit = usageLimit.trim()
      ? Number.parseInt(usageLimit, 10)
      : undefined;
    if (limit != null && (!Number.isFinite(limit) || limit < 1)) {
      toast.error("Usage limit must be at least 1.");
      return;
    }

    if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
      toast.error("End date must be after the start date.");
      return;
    }

    setSubmitting(true);
    try {
      addCoupon({
        code: trimmedCode,
        title: trimmedTitle,
        description: description.trim() || undefined,
        discountType,
        discountValue: value,
        minOrderAmount: minOrder,
        maxDiscountAmount:
          discountType === "percent" ? maxDiscount : undefined,
        usageLimit: limit,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        isActive,
      });
      toast.success("Coupon created");
      router.push(listHref);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <p className="text-sm text-[#6b7280]">Sign in to create coupons.</p>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage className="mx-auto max-w-3xl">
      <Link
        href={listHref}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#6b7280] transition hover:text-[#16a34a]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to coupons
      </Link>

      <header className="mt-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#0d9488] text-white shadow-md shadow-[#16a34a]/20">
            <Ticket className="size-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
              Add coupon
            </h1>
            <p className="mt-0.5 text-sm text-[#6b7280]">
              Set up a code shoppers can apply on their cart.
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <DashboardSurface className="overflow-hidden">
          <div className="border-b border-[#f0f1f4] bg-gradient-to-r from-[#f0fdf4] to-white px-5 py-4">
            <h2 className="text-base font-semibold text-[#1a1f2e]">
              Coupon details
            </h2>
            <p className="mt-0.5 text-xs text-[#9ca3af]">
              Saved on this device until merchant coupon APIs are connected.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <Field label="Coupon code" className="sm:col-span-2">
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. FRESH50"
                className={cn(inputClassName, "font-mono uppercase tracking-wide")}
                autoComplete="off"
              />
            </Field>

            <Field label="Display name" className="sm:col-span-2">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekend grocery saver"
                className={inputClassName}
              />
            </Field>

            <Field label="Description (optional)" className="sm:col-span-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Shown to your team for context"
                rows={3}
                className="min-h-[88px] w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 py-2 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              />
            </Field>

            <Field label="Discount type">
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as CouponDiscountType)
                }
                className={inputClassName}
              >
                <option value="percent">Percentage off</option>
                <option value="flat">Flat amount (₹)</option>
              </select>
            </Field>

            <Field
              label={
                discountType === "percent"
                  ? "Discount (%)"
                  : "Discount amount (₹)"
              }
            >
              <input
                required
                inputMode="decimal"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percent" ? "10" : "100"}
                className={inputClassName}
              />
            </Field>

            {discountType === "percent" ? (
              <Field label="Max discount cap (₹, optional)">
                <input
                  inputMode="decimal"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  placeholder="e.g. 200"
                  className={inputClassName}
                />
              </Field>
            ) : (
              <div className="hidden sm:block" />
            )}

            <Field label="Minimum order (₹, optional)">
              <input
                inputMode="decimal"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="e.g. 499"
                className={inputClassName}
              />
            </Field>

            <Field label="Total uses allowed (optional)">
              <input
                inputMode="numeric"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited if empty"
                className={inputClassName}
              />
            </Field>

            <Field label="Starts on (optional)">
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={inputClassName}
              />
            </Field>

            <Field label="Ends on (optional)">
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className={inputClassName}
              />
            </Field>

            <div className="sm:col-span-2">
              <label className="flex items-center justify-between gap-4 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#1a1f2e]">
                    Publish immediately
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    Turn off to save as paused
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  aria-label="Publish coupon immediately"
                />
              </label>
            </div>
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
            type="button"
            disabled={!hydrated || submitting}
            className="h-10 rounded-xl bg-[#16a34a] px-6 text-white hover:bg-[#15803d]"
            onClick={onCreate}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Create coupon"
            )}
          </Button>
        </div>
      </form>
    </DashboardPage>
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
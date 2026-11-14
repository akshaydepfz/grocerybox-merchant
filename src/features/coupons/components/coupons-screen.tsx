"use client";

import {
  CalendarClock,
  Copy,
  Percent,
  Plus,
  Search,
  Sparkles,
  Tag,
  Ticket,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/features/auth/components/auth-provider";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import { DashboardSurface } from "@/features/dashboard/components/dashboard-surface";
import { formatInr } from "@/features/products/utils/format-product";
import { dashboardRoutePrefix } from "@/config/routes";
import { cn } from "@/lib/utils";

import { useMerchantCoupons } from "../hooks/use-merchant-coupons";
import {
  resolveCouponLifecycle,
  type CouponLifecycle,
  type MerchantCoupon,
} from "../types/merchant-coupon";
import {
  formatCouponDateRange,
  formatCouponDiscount,
  formatCouponDiscountDetail,
} from "../utils/format-coupon";

type StatusFilter = "all" | CouponLifecycle;

const LIFECYCLE_STYLES: Record<
  CouponLifecycle,
  { label: string; badge: string; dot: string }
> = {
  active: {
    label: "Active",
    badge: "bg-[#dcfce7] text-[#15803d]",
    dot: "bg-[#22c55e]",
  },
  scheduled: {
    label: "Scheduled",
    badge: "bg-[#dbeafe] text-[#1d4ed8]",
    dot: "bg-[#3b82f6]",
  },
  expired: {
    label: "Expired",
    badge: "bg-[#f3f4f6] text-[#6b7280]",
    dot: "bg-[#9ca3af]",
  },
  inactive: {
    label: "Paused",
    badge: "bg-[#fef3c7] text-[#b45309]",
    dot: "bg-[#f59e0b]",
  },
};

export function CouponsScreen() {
  const { user } = useAuth();
  const {
    coupons,
    hydrated,
    loading,
    error,
    removeCoupon,
    toggleCouponActive,
  } = useMerchantCoupons();

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const search = searchInput.trim().toLowerCase();

  const enriched = useMemo(
    () =>
      coupons.map((coupon) => ({
        coupon,
        lifecycle: resolveCouponLifecycle(coupon),
      })),
    [coupons],
  );

  const filtered = useMemo(() => {
    return enriched.filter(({ coupon, lifecycle }) => {
      if (statusFilter !== "all" && lifecycle !== statusFilter) {
        return false;
      }
      if (!search) {
        return true;
      }
      return (
        coupon.code.toLowerCase().includes(search) ||
        coupon.title.toLowerCase().includes(search) ||
        (coupon.description?.toLowerCase().includes(search) ?? false)
      );
    });
  }, [enriched, search, statusFilter]);

  const stats = useMemo(() => {
    let active = 0;
    let scheduled = 0;
    let redemptions = 0;
    for (const { coupon, lifecycle } of enriched) {
      if (lifecycle === "active") active += 1;
      if (lifecycle === "scheduled") scheduled += 1;
      redemptions += coupon.usedCount;
    }
    return { active, scheduled, redemptions, total: coupons.length };
  }, [enriched, coupons.length]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Coupon code copied");
    } catch {
      toast.error("Could not copy code");
    }
  };

  if (!user) {
    return (
      <DashboardPage className="py-4">
        <p className="text-sm text-[#6b7280]">Sign in to manage coupons.</p>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
            Coupons
          </h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Create discount codes customers can apply at checkout.
          </p>
        </div>
        <Button
          type="button"
          className="h-10 shrink-0 rounded-xl bg-[#16a34a] px-4 text-sm font-semibold text-white hover:bg-[#15803d]"
          asChild
        >
          <Link href={`${dashboardRoutePrefix}/coupons/new`}>
            <Plus className="size-4" aria-hidden />
            Add Coupon
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total coupons"
          value={hydrated ? stats.total.toString() : "—"}
          hint="In your store"
          icon={Ticket}
          cardBg="bg-gradient-to-br from-[#f0fdf4] to-white"
          iconBg="bg-[#dcfce7]"
          iconColor="text-[#16a34a]"
        />
        <StatCard
          label="Active now"
          value={hydrated ? stats.active.toString() : "—"}
          hint="Live for shoppers"
          icon={Sparkles}
          cardBg="bg-gradient-to-br from-[#ecfdf5] to-white"
          iconBg="bg-[#bbf7d0]"
          iconColor="text-[#15803d]"
        />
        <StatCard
          label="Scheduled"
          value={hydrated ? stats.scheduled.toString() : "—"}
          hint="Starting soon"
          icon={CalendarClock}
          cardBg="bg-gradient-to-br from-[#eff6ff] to-white"
          iconBg="bg-[#dbeafe]"
          iconColor="text-[#2563eb]"
        />
        <StatCard
          label="Redemptions"
          value={hydrated ? stats.redemptions.toString() : "—"}
          hint="Times used (local)"
          icon={TrendingUp}
          cardBg="bg-gradient-to-br from-[#faf5ff] to-white"
          iconBg="bg-[#ede9fe]"
          iconColor="text-[#7c3aed]"
        />
      </section>

      <DashboardSurface>
        <div className="flex flex-col gap-3 border-b border-[#f0f1f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1a1f2e]">
              Your coupons
            </h2>
            <p className="mt-0.5 text-xs text-[#9ca3af]">
              Tap a code to copy · toggle to pause without deleting
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:max-w-lg sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search by code or name…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#e8eaef] bg-[#fafbfc] pl-10 pr-3 text-sm text-[#1a1f2e] placeholder:text-[#9ca3af] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-10 rounded-xl border border-[#e8eaef] bg-[#fafbfc] px-3 text-sm text-[#1a1f2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/30"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="inactive">Paused</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="px-5 py-16 text-center text-sm text-red-600">
            {error}
          </div>
        ) : !hydrated || loading ? (
          <div className="px-5 py-16 text-center text-sm text-[#6b7280]">
            Loading coupons…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyCoupons
            hasFilters={Boolean(search) || statusFilter !== "all"}
            hasAny={coupons.length > 0}
          />
        ) : (
          <ul className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(({ coupon, lifecycle }) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                lifecycle={lifecycle}
                onCopy={() => void copyCode(coupon.code)}
                onToggleActive={(checked) => {
                  void (async () => {
                    try {
                      await toggleCouponActive(coupon.id, checked);
                      toast.success(checked ? "Coupon is live" : "Coupon paused");
                    } catch {
                      toast.error("Unable to update coupon status.");
                    }
                  })();
                }}
                onDelete={() => {
                  void (async () => {
                    try {
                      await removeCoupon(coupon.id);
                      toast.success("Coupon removed");
                    } catch {
                      toast.error("Unable to remove coupon.");
                    }
                  })();
                }}
              />
            ))}
          </ul>
        )}
      </DashboardSurface>
    </DashboardPage>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: typeof Ticket;
  cardBg: string;
  iconBg: string;
  iconColor: string;
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  cardBg,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#e8f5e9] p-5",
        cardBg,
      )}
    >
      <div
        className={cn(
          "absolute right-4 top-4 flex size-11 items-center justify-center rounded-xl",
          iconBg,
        )}
      >
        <Icon className={cn("size-5", iconColor)} aria-hidden />
      </div>
      <p className="text-sm font-medium text-[#6b7280]">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[#1a1f2e]">
        {value}
      </p>
      <p className="mt-2 text-xs font-medium text-[#9ca3af]">{hint}</p>
    </div>
  );
}

function EmptyCoupons({
  hasFilters,
  hasAny,
}: {
  hasFilters: boolean;
  hasAny: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-16 text-center">
      <div className="relative">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#0d9488] shadow-lg shadow-[#16a34a]/25">
          <Ticket className="size-9 text-white" aria-hidden />
        </div>
        <span className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full bg-[#fef3c7] text-[#b45309] shadow-sm">
          <Percent className="size-4" aria-hidden />
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1a1f2e]">
          {hasFilters
            ? "No coupons match your filters"
            : hasAny
              ? "Nothing to show"
              : "No coupons yet"}
        </p>
        <p className="mt-1 max-w-sm text-sm text-[#6b7280]">
          {hasFilters
            ? "Try a different search or status filter."
            : "Launch your first offer — flat rupees off or a percentage discount."}
        </p>
      </div>
      {!hasFilters ? (
        <Button
          type="button"
          className="mt-1 bg-[#16a34a] text-white hover:bg-[#15803d]"
          asChild
        >
          <Link href={`${dashboardRoutePrefix}/coupons/new`}>
            <Plus className="size-4" aria-hidden />
            Add Coupon
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

type CouponCardProps = {
  coupon: MerchantCoupon;
  lifecycle: CouponLifecycle;
  onCopy: () => void;
  onToggleActive: (active: boolean) => void;
  onDelete: () => void;
};

function CouponCard({
  coupon,
  lifecycle,
  onCopy,
  onToggleActive,
  onDelete,
}: CouponCardProps) {
  const style = LIFECYCLE_STYLES[lifecycle];
  const usageLabel =
    coupon.usageLimit != null && coupon.usageLimit > 0
      ? `${coupon.usedCount} / ${coupon.usageLimit} used`
      : `${coupon.usedCount} used`;

  return (
    <li
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border border-[#e8eaef] bg-white shadow-sm transition hover:border-[#bbf7d0] hover:shadow-md",
        lifecycle === "expired" && "opacity-80",
      )}
    >
      <div className="relative flex w-[7.5rem] shrink-0 flex-col justify-between bg-gradient-to-br from-[#16a34a] via-[#11966d] to-[#0d9488] p-4 text-white">
        <div
          className="pointer-events-none absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-[#f5f6f8]"
          aria-hidden
        />
        <Tag className="size-4 opacity-80" aria-hidden />
        <p className="text-lg font-bold leading-tight tracking-tight">
          {formatCouponDiscount(coupon.discountType, coupon.discountValue)}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/75">
          {coupon.discountType === "percent" ? "Percentage" : "Flat"}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#1a1f2e]">
              {coupon.title}
            </p>
            {coupon.description ? (
              <p className="mt-0.5 line-clamp-2 text-xs text-[#6b7280]">
                {coupon.description}
              </p>
            ) : null}
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              style.badge,
            )}
          >
            <span
              className={cn("size-1.5 rounded-full", style.dot)}
              aria-hidden
            />
            {style.label}
          </span>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-left transition hover:border-[#16a34a] hover:bg-[#ecfdf5]"
        >
          <span className="truncate font-mono text-sm font-bold tracking-wide text-[#15803d]">
            {coupon.code}
          </span>
          <Copy className="size-4 shrink-0 text-[#16a34a]" aria-hidden />
        </button>

        <ul className="space-y-1 text-xs text-[#6b7280]">
          <li>{formatCouponDiscountDetail(coupon)}</li>
          {coupon.minOrderAmount != null && coupon.minOrderAmount > 0 ? (
            <li>Min order {formatInr(coupon.minOrderAmount)}</li>
          ) : null}
          <li>{formatCouponDateRange(coupon.startsAt, coupon.endsAt)}</li>
          <li>{usageLabel}</li>
        </ul>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#f0f1f4] pt-3">
          <label className="flex items-center gap-2 text-xs font-medium text-[#6b7280]">
            <Switch
              checked={coupon.isActive}
              onCheckedChange={onToggleActive}
              aria-label={`${coupon.isActive ? "Pause" : "Activate"} ${coupon.code}`}
            />
            {coupon.isActive ? "Live" : "Paused"}
          </label>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-[#9ca3af] hover:bg-[#fef2f2] hover:text-[#dc2626]"
            onClick={onDelete}
            aria-label={`Delete ${coupon.code}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}
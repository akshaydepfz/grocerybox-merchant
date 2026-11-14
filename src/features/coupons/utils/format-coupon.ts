import { formatInr } from "@/features/products/utils/format-product";

import type { CouponDiscountType, MerchantCoupon } from "../types/merchant-coupon";

export function formatCouponDiscount(
  discountType: CouponDiscountType,
  discountValue: number,
): string {
  if (discountType === "percent") {
    return `${discountValue}% OFF`;
  }
  return `${formatInr(discountValue, true)} OFF`;
}

export function formatCouponDiscountDetail(coupon: MerchantCoupon): string {
  if (coupon.discountType === "percent") {
    const capped =
      coupon.maxDiscountAmount != null && coupon.maxDiscountAmount > 0
        ? ` · max ${formatInr(coupon.maxDiscountAmount, true)}`
        : "";
    return `${coupon.discountValue}% off${capped}`;
  }
  return `${formatInr(coupon.discountValue)} off`;
}

export function formatCouponDateRange(
  startsAt?: string,
  endsAt?: string,
): string {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const start =
    startsAt && !Number.isNaN(new Date(startsAt).getTime())
      ? formatter.format(new Date(startsAt))
      : null;
  const end =
    endsAt && !Number.isNaN(new Date(endsAt).getTime())
      ? formatter.format(new Date(endsAt))
      : null;

  if (start && end) {
    return `${start} – ${end}`;
  }
  if (end) {
    return `Until ${end}`;
  }
  if (start) {
    return `From ${start}`;
  }
  return "No end date";
}
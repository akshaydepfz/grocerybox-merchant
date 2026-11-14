export type CouponDiscountType = "percent" | "flat";

export type MerchantCoupon = {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  createdAt: string;
};

export type MerchantCouponDraft = {
  code: string;
  title: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
};

export type CouponLifecycle = "active" | "scheduled" | "expired" | "inactive";

export function resolveCouponLifecycle(
  coupon: MerchantCoupon,
  now = new Date(),
): CouponLifecycle {
  if (!coupon.isActive) {
    return "inactive";
  }
  if (coupon.startsAt) {
    const start = new Date(coupon.startsAt);
    if (!Number.isNaN(start.getTime()) && start > now) {
      return "scheduled";
    }
  }
  if (coupon.endsAt) {
    const end = new Date(coupon.endsAt);
    if (!Number.isNaN(end.getTime()) && end < now) {
      return "expired";
    }
  }
  return "active";
}
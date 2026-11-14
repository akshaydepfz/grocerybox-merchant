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

export type CouponPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MerchantCouponListResult = {
  items: MerchantCoupon[];
  pagination: CouponPagination;
};

export type MerchantCouponListParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

function optionalString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  return value;
}

export function merchantCouponFromJson(
  raw: Record<string, unknown>,
): MerchantCoupon {
  const discountTypeRaw = String(raw.discount_type ?? "percent");
  return {
    id: String(raw.id ?? ""),
    code: String(raw.code ?? ""),
    title: String(raw.title ?? ""),
    description: optionalString(raw.description),
    discountType: discountTypeRaw === "flat" ? "flat" : "percent",
    discountValue:
      typeof raw.discount_value === "number" ? raw.discount_value : 0,
    minOrderAmount: optionalNumber(raw.min_order_amount),
    maxDiscountAmount: optionalNumber(raw.max_discount_amount),
    usageLimit:
      typeof raw.usage_limit === "number" ? raw.usage_limit : undefined,
    usedCount: typeof raw.used_count === "number" ? raw.used_count : 0,
    startsAt: optionalString(raw.starts_at),
    endsAt: optionalString(raw.ends_at),
    isActive: Boolean(raw.is_active),
    createdAt: String(raw.created_at ?? ""),
  };
}

export function parseCouponListData(data: unknown): MerchantCouponListResult {
  if (!data || typeof data !== "object") {
    return {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
  const record = data as Record<string, unknown>;
  const itemsRaw = Array.isArray(record.items) ? record.items : [];
  const items = itemsRaw
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === "object",
    )
    .map((item) => merchantCouponFromJson(item));

  const paginationRaw =
    record.pagination && typeof record.pagination === "object"
      ? (record.pagination as Record<string, unknown>)
      : {};

  return {
    items,
    pagination: {
      page: typeof paginationRaw.page === "number" ? paginationRaw.page : 1,
      limit: typeof paginationRaw.limit === "number" ? paginationRaw.limit : 20,
      total: typeof paginationRaw.total === "number" ? paginationRaw.total : 0,
      totalPages:
        typeof paginationRaw.total_pages === "number"
          ? paginationRaw.total_pages
          : 0,
    },
  };
}

export function couponCreateToJson(
  draft: MerchantCouponDraft,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    code: draft.code.trim().toUpperCase(),
    title: draft.title.trim(),
    discount_type: draft.discountType,
    discount_value: draft.discountValue,
    is_active: draft.isActive,
  };
  if (draft.description?.trim()) {
    body.description = draft.description.trim();
  }
  if (draft.minOrderAmount != null) {
    body.min_order_amount = draft.minOrderAmount;
  }
  if (draft.maxDiscountAmount != null) {
    body.max_discount_amount = draft.maxDiscountAmount;
  }
  if (draft.usageLimit != null) {
    body.usage_limit = draft.usageLimit;
  }
  if (draft.startsAt) {
    body.starts_at = draft.startsAt;
  }
  if (draft.endsAt) {
    body.ends_at = draft.endsAt;
  }
  return body;
}

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
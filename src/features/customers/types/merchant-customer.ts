export type MerchantCustomerListItem = {
  phone: string;
  displayName: string;
  orderCount: number;
  savedAddressCount: number;
  lastOrderAt: string | null;
  firstOrderAt: string | null;
  lifetimeSpend: number;
};

export type MerchantCustomerListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type MerchantCustomerListResult = {
  items: MerchantCustomerListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function merchantCustomerListItemFromJson(
  raw: Record<string, unknown>,
): MerchantCustomerListItem {
  return {
    phone: String(raw.phone ?? ""),
    displayName: String(raw.display_name ?? ""),
    orderCount: typeof raw.order_count === "number" ? raw.order_count : 0,
    savedAddressCount:
      typeof raw.saved_address_count === "number" ? raw.saved_address_count : 0,
    lastOrderAt:
      raw.last_order_at != null && String(raw.last_order_at).length > 0
        ? String(raw.last_order_at)
        : null,
    firstOrderAt:
      raw.first_order_at != null && String(raw.first_order_at).length > 0
        ? String(raw.first_order_at)
        : null,
    lifetimeSpend: typeof raw.lifetime_spend === "number" ? raw.lifetime_spend : 0,
  };
}

export function parseCustomerListData(data: unknown): MerchantCustomerListResult {
  if (!data || typeof data !== "object") {
    return {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
  const record = data as Record<string, unknown>;
  const itemsRaw = Array.isArray(record.items) ? record.items : [];
  const paginationRaw =
    record.pagination && typeof record.pagination === "object"
      ? (record.pagination as Record<string, unknown>)
      : {};

  return {
    items: itemsRaw
      .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
      .map((item) => merchantCustomerListItemFromJson(item)),
    pagination: {
      page: typeof paginationRaw.page === "number" ? paginationRaw.page : 1,
      limit: typeof paginationRaw.limit === "number" ? paginationRaw.limit : 20,
      total: typeof paginationRaw.total === "number" ? paginationRaw.total : 0,
      totalPages:
        typeof paginationRaw.total_pages === "number" ? paginationRaw.total_pages : 0,
    },
  };
}
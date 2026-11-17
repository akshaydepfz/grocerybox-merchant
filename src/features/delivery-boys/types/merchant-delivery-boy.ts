export type DeliveryBoyCommissionType = "fixed" | "percentage";

export type DeliveryBoyStatus = "active" | "inactive";

export type MerchantDeliveryBoy = {
  id: string;
  fullName: string;
  phone: string;
  commissionType: DeliveryBoyCommissionType;
  commissionValue: number;
  totalDeliveries: number;
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type MerchantDeliveryBoySummary = {
  total: number;
  active: number;
  inactive: number;
  totalDeliveries: number;
};

export type MerchantDeliveryBoyCreateInput = {
  fullName: string;
  phone: string;
  password: string;
  commissionType: DeliveryBoyCommissionType;
  commissionValue: number;
  isActive: boolean;
};

export type MerchantDeliveryBoyUpdateInput = {
  fullName: string;
  phone: string;
  password?: string;
  commissionType: DeliveryBoyCommissionType;
  commissionValue: number;
  isActive: boolean;
};

export type DeliveryBoyListPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MerchantDeliveryBoyListResult = {
  items: MerchantDeliveryBoy[];
  pagination: DeliveryBoyListPagination;
};

export type MerchantDeliveryBoyListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | DeliveryBoyStatus;
};

export function merchantDeliveryBoyFromJson(
  raw: Record<string, unknown>,
): MerchantDeliveryBoy {
  const commissionTypeRaw = String(raw.commission_type ?? "fixed");
  return {
    id: String(raw.id ?? ""),
    fullName: String(raw.full_name ?? ""),
    phone: String(raw.phone ?? ""),
    commissionType:
      commissionTypeRaw === "percentage" ? "percentage" : "fixed",
    commissionValue:
      typeof raw.commission_value === "number" ? raw.commission_value : 0,
    totalDeliveries:
      typeof raw.total_deliveries === "number" ? raw.total_deliveries : 0,
    isActive: Boolean(raw.is_active),
    joinedAt: String(raw.joined_at ?? raw.created_at ?? ""),
    createdAt: String(raw.created_at ?? ""),
    updatedAt: String(raw.updated_at ?? ""),
  };
}

export function parseDeliveryBoyListData(
  data: unknown,
): MerchantDeliveryBoyListResult {
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
    .map((item) => merchantDeliveryBoyFromJson(item));

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

export function deliveryBoySummaryFromJson(
  raw: Record<string, unknown>,
): MerchantDeliveryBoySummary {
  return {
    total: typeof raw.total === "number" ? raw.total : 0,
    active: typeof raw.active === "number" ? raw.active : 0,
    inactive: typeof raw.inactive === "number" ? raw.inactive : 0,
    totalDeliveries:
      typeof raw.total_deliveries === "number" ? raw.total_deliveries : 0,
  };
}

export function deliveryBoyCreateToJson(
  input: MerchantDeliveryBoyCreateInput,
): Record<string, unknown> {
  return {
    full_name: input.fullName.trim(),
    phone: input.phone.replace(/\D/g, ""),
    password: input.password,
    commission_type: input.commissionType,
    commission_value: input.commissionValue,
    is_active: input.isActive,
  };
}

export function deliveryBoyUpdateToJson(
  input: MerchantDeliveryBoyUpdateInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    full_name: input.fullName.trim(),
    phone: input.phone.replace(/\D/g, ""),
    commission_type: input.commissionType,
    commission_value: input.commissionValue,
    is_active: input.isActive,
  };
  if (input.password?.trim()) {
    body.password = input.password;
  }
  return body;
}
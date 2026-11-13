export type MerchantSubcategory = {
  id: string;
  merchantId: string;
  categoryId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubcategoryPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MerchantSubcategoryListResult = {
  items: MerchantSubcategory[];
  pagination: SubcategoryPagination;
};

export type MerchantSubcategoryListParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

export type CreateMerchantSubcategoryRequest = {
  name: string;
  imageUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};

export type UpdateMerchantSubcategoryRequest = {
  name: string;
  imageUrl?: string | null;
  touchImageUrl?: boolean;
  displayOrder?: number;
  isActive?: boolean;
};

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function merchantSubcategoryFromJson(
  raw: Record<string, unknown>,
): MerchantSubcategory {
  return {
    id: String(raw.id ?? ""),
    merchantId: String(raw.merchant_id ?? ""),
    categoryId: String(raw.category_id ?? ""),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    imageUrl: nullableString(raw.image_url),
    displayOrder:
      typeof raw.display_order === "number" ? raw.display_order : 0,
    isActive: Boolean(raw.is_active),
    createdAt: String(raw.created_at ?? ""),
    updatedAt: String(raw.updated_at ?? ""),
  };
}

export function parseSubcategoryListData(
  data: unknown,
): MerchantSubcategoryListResult {
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
    .map((item) => merchantSubcategoryFromJson(item));

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

export function subcategoryCreateToJson(
  input: CreateMerchantSubcategoryRequest,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: input.name.trim(),
  };
  if (input.imageUrl != null && input.imageUrl.trim().length > 0) {
    body.image_url = input.imageUrl.trim();
  }
  if (input.displayOrder != null) {
    body.display_order = input.displayOrder;
  }
  if (input.isActive != null) {
    body.is_active = input.isActive;
  }
  return body;
}

export function subcategoryUpdateToJson(
  input: UpdateMerchantSubcategoryRequest,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: input.name.trim(),
  };
  if (input.touchImageUrl) {
    body.image_url =
      input.imageUrl != null && input.imageUrl.trim().length > 0
        ? input.imageUrl.trim()
        : "";
  }
  if (input.displayOrder != null) {
    body.display_order = input.displayOrder;
  }
  if (input.isActive != null) {
    body.is_active = input.isActive;
  }
  return body;
}

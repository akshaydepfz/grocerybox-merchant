export type MerchantProductUnit =
  | "kg"
  | "g"
  | "litre"
  | "ml"
  | "piece"
  | "pack"
  | "dozen"
  | "box";

export type MerchantProductStockStatus =
  | "in_stock"
  | "out_of_stock"
  | "low_stock";

export type MerchantProductSortBy =
  | "name"
  | "selling_price"
  | "stock_quantity"
  | "created_at"
  | "updated_at"
  | "display_order";

export type MerchantProductSortOrder = "asc" | "desc";

export type MerchantProductCatalogSummary = {
  id: string;
  name: string;
  slug: string;
};

export type MerchantProductImage = {
  id: string;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
};

export type MerchantProduct = {
  id: string;
  merchantId: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  name: string;
  slug: string;
  description: string | null;
  sellingPrice: number;
  mrp: number | null;
  unitValue: number;
  unit: MerchantProductUnit;
  stockQuantity: number;
  sku: string | null;
  barcode: string | null;
  brand: string | null;
  taxPercentage: number | null;
  minOrderQuantity: number | null;
  maxOrderQuantity: number | null;
  isFeatured: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: MerchantProductCatalogSummary | null;
  subcategory: MerchantProductCatalogSummary | null;
  primaryImage: MerchantProductImage | null;
  images: MerchantProductImage[];
};

export type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MerchantProductListResult = {
  items: MerchantProduct[];
  pagination: ProductPagination;
};

export type MerchantProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  stockStatus?: MerchantProductStockStatus;
  sortBy?: MerchantProductSortBy;
  sortOrder?: MerchantProductSortOrder;
};

export type MerchantProductCreateInput = {
  name: string;
  categoryId: string;
  subcategoryId?: string;
  description?: string;
  sellingPrice: number;
  mrp?: number;
  unitValue?: number;
  unit: MerchantProductUnit;
  stockQuantity?: number;
  sku?: string;
  barcode?: string;
  brand?: string;
  taxPercentage?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  isFeatured?: boolean;
  displayOrder?: number;
  isActive?: boolean;
};

export type MerchantProductImageAssociateInput = {
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
};

export function productCreateToJson(
  input: MerchantProductCreateInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: input.name.trim(),
    category_id: input.categoryId.trim(),
    selling_price: input.sellingPrice,
    unit: input.unit,
  };

  if (input.subcategoryId?.trim()) {
    body.subcategory_id = input.subcategoryId.trim();
  }
  if (input.description?.trim()) {
    body.description = input.description.trim();
  }
  if (input.mrp != null && Number.isFinite(input.mrp)) {
    body.mrp = input.mrp;
  }
  if (input.unitValue != null && Number.isFinite(input.unitValue)) {
    body.unit_value = input.unitValue;
  }
  if (input.stockQuantity != null && Number.isFinite(input.stockQuantity)) {
    body.stock_quantity = input.stockQuantity;
  }
  if (input.sku?.trim()) {
    body.sku = input.sku.trim();
  }
  if (input.barcode?.trim()) {
    body.barcode = input.barcode.trim();
  }
  if (input.brand?.trim()) {
    body.brand = input.brand.trim();
  }
  if (input.taxPercentage != null && Number.isFinite(input.taxPercentage)) {
    body.tax_percentage = input.taxPercentage;
  }
  if (
    input.minOrderQuantity != null &&
    Number.isFinite(input.minOrderQuantity)
  ) {
    body.min_order_quantity = input.minOrderQuantity;
  }
  if (
    input.maxOrderQuantity != null &&
    Number.isFinite(input.maxOrderQuantity)
  ) {
    body.max_order_quantity = input.maxOrderQuantity;
  }
  if (input.isFeatured != null) {
    body.is_featured = input.isFeatured;
  }
  if (input.displayOrder != null) {
    body.display_order = input.displayOrder;
  }
  if (input.isActive != null) {
    body.is_active = input.isActive;
  }

  return body;
}

export function productImagesAssociateToJson(
  images: MerchantProductImageAssociateInput[],
): Record<string, unknown> {
  return {
    images: images.map((image) => ({
      image_url: image.imageUrl,
      display_order: image.displayOrder,
      is_primary: image.isPrimary,
    })),
  };
}

function nullableString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function nullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCatalogSummary(
  raw: unknown,
): MerchantProductCatalogSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = String(record.id ?? "");
  if (!id) return null;
  return {
    id,
    name: String(record.name ?? ""),
    slug: String(record.slug ?? ""),
  };
}

export function merchantProductImageFromJson(
  raw: Record<string, unknown>,
): MerchantProductImage {
  return {
    id: String(raw.id ?? ""),
    imageUrl: String(raw.image_url ?? ""),
    displayOrder:
      typeof raw.display_order === "number" ? raw.display_order : 0,
    isPrimary: Boolean(raw.is_primary),
    createdAt: String(raw.created_at ?? ""),
  };
}

export function merchantProductFromJson(
  raw: Record<string, unknown>,
): MerchantProduct {
  const imagesRaw = Array.isArray(raw.images) ? raw.images : [];
  const images = imagesRaw
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === "object",
    )
    .map((item) => merchantProductImageFromJson(item));

  const primaryFromField =
    raw.primary_image && typeof raw.primary_image === "object"
      ? merchantProductImageFromJson(
          raw.primary_image as Record<string, unknown>,
        )
      : null;
  const primaryImage =
    primaryFromField ?? images.find((image) => image.isPrimary) ?? null;

  const unitRaw = String(raw.unit ?? "piece").toLowerCase();
  const unit = unitRaw as MerchantProductUnit;

  const subcategoryId = nullableString(raw.subcategory_id);
  const category = parseCatalogSummary(raw.category);
  const subcategory = parseCatalogSummary(raw.subcategory);

  return {
    id: String(raw.id ?? ""),
    merchantId: String(raw.merchant_id ?? ""),
    categoryId: String(raw.category_id ?? ""),
    categoryName:
      nullableString(raw.category_name) ?? category?.name ?? "",
    subcategoryId,
    subcategoryName:
      nullableString(raw.subcategory_name) ?? subcategory?.name ?? null,
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    description: nullableString(raw.description),
    sellingPrice:
      typeof raw.selling_price === "number" ? raw.selling_price : 0,
    mrp: nullableNumber(raw.mrp),
    unitValue: typeof raw.unit_value === "number" ? raw.unit_value : 1,
    unit,
    stockQuantity:
      typeof raw.stock_quantity === "number" ? raw.stock_quantity : 0,
    sku: nullableString(raw.sku),
    barcode: nullableString(raw.barcode),
    brand: nullableString(raw.brand),
    taxPercentage: nullableNumber(raw.tax_percentage),
    minOrderQuantity: nullableNumber(raw.min_order_quantity),
    maxOrderQuantity: nullableNumber(raw.max_order_quantity),
    isFeatured: Boolean(raw.is_featured),
    displayOrder:
      typeof raw.display_order === "number" ? raw.display_order : 0,
    isActive: Boolean(raw.is_active),
    createdAt: String(raw.created_at ?? ""),
    updatedAt: String(raw.updated_at ?? ""),
    category,
    subcategory,
    primaryImage,
    images,
  };
}

export function parseProductListData(data: unknown): MerchantProductListResult {
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
    .map((item) => merchantProductFromJson(item));

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

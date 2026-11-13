import type { MerchantProductUnit } from "../types/merchant-product";

export const MERCHANT_PRODUCT_NAME_MAX_LEN = 255;
export const MERCHANT_PRODUCT_SKU_MAX_LEN = 100;
export const MERCHANT_PRODUCT_BRAND_MAX_LEN = 150;

const SUPPORTED_UNITS: MerchantProductUnit[] = [
  "kg",
  "g",
  "litre",
  "ml",
  "piece",
  "pack",
  "dozen",
  "box",
];

export type ProductCreateFormValues = {
  name: string;
  brand: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  sellingPrice: string;
  mrp: string;
  unit: MerchantProductUnit | "";
  unitValue: string;
  stockQuantity: string;
  sku: string;
  barcode: string;
  taxPercentage: string;
  minOrderQuantity: string;
  maxOrderQuantity: string;
  displayOrder: string;
  isFeatured: boolean;
  isActive: boolean;
};

export type ProductCreateFieldErrors = Partial<
  Record<keyof ProductCreateFormValues, string>
>;

export const defaultProductCreateForm = (): ProductCreateFormValues => ({
  name: "",
  brand: "",
  description: "",
  categoryId: "",
  subcategoryId: "",
  sellingPrice: "",
  mrp: "",
  unit: "",
  unitValue: "1",
  stockQuantity: "0",
  sku: "",
  barcode: "",
  taxPercentage: "",
  minOrderQuantity: "",
  maxOrderQuantity: "",
  displayOrder: "0",
  isFeatured: false,
  isActive: true,
});

function parseRequiredPositiveFloat(
  raw: string,
  label: string,
): { value?: number; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return { error: `${label} must be a valid number` };
  }
  if (value <= 0) {
    return { error: `${label} must be greater than zero` };
  }
  return { value };
}

function parseOptionalFloat(
  raw: string,
  label: string,
): { value?: number; error?: string; provided: boolean } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { provided: false };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return { provided: true, error: `${label} must be a valid number` };
  }
  return { provided: true, value };
}

function parseNonNegativeFloat(
  raw: string,
  label: string,
): { value?: number; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { value: 0 };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return { error: `${label} must be a valid number` };
  }
  if (value < 0) {
    return { error: `${label} cannot be negative` };
  }
  return { value };
}

function parseNonNegativeInt(
  raw: string,
  label: string,
): { value?: number; error?: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { value: 0 };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return { error: `${label} must be a whole number` };
  }
  if (value < 0) {
    return { error: `${label} cannot be negative` };
  }
  return { value };
}

export type ProductCreateValidatedPayload = {
  name: string;
  brand?: string;
  description?: string;
  categoryId: string;
  subcategoryId?: string;
  sellingPrice: number;
  mrp?: number;
  unit: MerchantProductUnit;
  unitValue: number;
  stockQuantity: number;
  sku?: string;
  barcode?: string;
  taxPercentage?: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
};

export function validateProductCreateForm(
  form: ProductCreateFormValues,
): {
  errors: ProductCreateFieldErrors;
  payload?: ProductCreateValidatedPayload;
} {
  const errors: ProductCreateFieldErrors = {};

  const name = form.name.trim();
  if (!name) {
    errors.name = "Product name is required";
  } else if (name.length > MERCHANT_PRODUCT_NAME_MAX_LEN) {
    errors.name = "Product name is too long";
  }

  const brand = form.brand.trim();
  if (brand.length > MERCHANT_PRODUCT_BRAND_MAX_LEN) {
    errors.brand = "Brand is too long";
  }

  if (!form.categoryId.trim()) {
    errors.categoryId = "Category is required";
  }

  const sellingPrice = parseRequiredPositiveFloat(
    form.sellingPrice,
    "Selling price",
  );
  if (sellingPrice.error) {
    errors.sellingPrice = sellingPrice.error;
  }

  const mrp = parseOptionalFloat(form.mrp, "MRP");
  if (mrp.error) {
    errors.mrp = mrp.error;
  } else if (
    mrp.provided &&
    mrp.value != null &&
    sellingPrice.value != null &&
    mrp.value < sellingPrice.value
  ) {
    errors.mrp = "MRP must be greater than or equal to selling price";
  }

  if (!form.unit) {
    errors.unit = "Unit is required";
  } else if (!SUPPORTED_UNITS.includes(form.unit)) {
    errors.unit = "Unit is not supported";
  }

  const unitValue = parseRequiredPositiveFloat(form.unitValue, "Unit value");
  if (unitValue.error) {
    errors.unitValue = unitValue.error;
  }

  const stockQuantity = parseNonNegativeFloat(
    form.stockQuantity,
    "Stock quantity",
  );
  if (stockQuantity.error) {
    errors.stockQuantity = stockQuantity.error;
  }

  const sku = form.sku.trim();
  if (sku.length > MERCHANT_PRODUCT_SKU_MAX_LEN) {
    errors.sku = "SKU is too long";
  }

  const tax = parseOptionalFloat(form.taxPercentage, "Tax percentage");
  if (tax.error) {
    errors.taxPercentage = tax.error;
  } else if (tax.provided && tax.value != null) {
    if (tax.value < 0 || tax.value > 100) {
      errors.taxPercentage = "Tax percentage must be between 0 and 100";
    }
  }

  const minQty = parseOptionalFloat(form.minOrderQuantity, "Minimum order quantity");
  if (minQty.error) {
    errors.minOrderQuantity = minQty.error;
  } else if (minQty.provided && minQty.value != null && minQty.value <= 0) {
    errors.minOrderQuantity =
      "Minimum order quantity must be greater than zero";
  }

  const maxQty = parseOptionalFloat(form.maxOrderQuantity, "Maximum order quantity");
  if (maxQty.error) {
    errors.maxOrderQuantity = maxQty.error;
  } else if (maxQty.provided && maxQty.value != null && maxQty.value <= 0) {
    errors.maxOrderQuantity =
      "Maximum order quantity must be greater than zero";
  }

  if (
    minQty.value != null &&
    maxQty.value != null &&
    maxQty.value < minQty.value
  ) {
    errors.maxOrderQuantity =
      "Maximum order quantity must be greater than or equal to minimum order quantity";
  }

  const displayOrder = parseNonNegativeInt(form.displayOrder, "Display order");
  if (displayOrder.error) {
    errors.displayOrder = displayOrder.error;
  }

  if (Object.keys(errors).length > 0 || !form.unit) {
    return { errors };
  }

  if (sellingPrice.value == null || unitValue.value == null) {
    return { errors };
  }

  return {
    errors,
    payload: {
      name,
      brand: brand || undefined,
      description: form.description.trim() || undefined,
      categoryId: form.categoryId.trim(),
      subcategoryId: form.subcategoryId.trim() || undefined,
      sellingPrice: sellingPrice.value,
      mrp: mrp.provided ? mrp.value : undefined,
      unit: form.unit as MerchantProductUnit,
      unitValue: unitValue.value,
      stockQuantity: stockQuantity.value ?? 0,
      sku: sku || undefined,
      barcode: form.barcode.trim() || undefined,
      taxPercentage: tax.provided ? tax.value : undefined,
      minOrderQuantity: minQty.provided ? minQty.value : undefined,
      maxOrderQuantity: maxQty.provided ? maxQty.value : undefined,
      displayOrder: displayOrder.value ?? 0,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    },
  };
}

export function computeDiscountPercent(
  sellingPrice: number,
  mrp: number | undefined,
): number | null {
  if (mrp == null || !Number.isFinite(mrp) || mrp <= sellingPrice) {
    return null;
  }
  return Math.round(((mrp - sellingPrice) / mrp) * 1000) / 10;
}

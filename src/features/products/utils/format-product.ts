import type { MerchantProductUnit } from "../types/merchant-product";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const inrCompactFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(amount: number, compact = false): string {
  if (!Number.isFinite(amount)) {
    return compact ? inrCompactFormatter.format(0) : inrFormatter.format(0);
  }
  return compact ? inrCompactFormatter.format(amount) : inrFormatter.format(amount);
}

const UNIT_LABELS: Record<MerchantProductUnit, string> = {
  kg: "kg",
  g: "g",
  litre: "L",
  ml: "ml",
  piece: "pc",
  pack: "pack",
  dozen: "dz",
  box: "box",
};

export function formatProductUnitLabel(unit: MerchantProductUnit): string {
  return UNIT_LABELS[unit] ?? unit;
}

export function formatStockQuantity(
  quantity: number,
  unitValue: number,
  unit: MerchantProductUnit,
): string {
  const unitLabel = formatProductUnitLabel(unit);
  const valueText =
    unitValue !== 1
      ? `${formatQuantityNumber(unitValue)} ${unitLabel}`
      : unitLabel;
  return `${formatQuantityNumber(quantity)} × ${valueText}`;
}

function formatQuantityNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function formatSkuOrFallback(
  sku: string | null,
  barcode: string | null,
  productId: string,
): string {
  if (sku?.trim()) {
    return sku.trim();
  }
  if (barcode?.trim()) {
    return barcode.trim();
  }
  return productId.slice(0, 8).toUpperCase();
}

/** Matches backend DefaultMerchantProductLowStockThreshold until merchant settings exist. */
export const PRODUCT_LOW_STOCK_THRESHOLD = 10;

export function resolveStockLabel(stockQuantity: number): "in" | "low" | "out" {
  if (stockQuantity <= 0) {
    return "out";
  }
  if (stockQuantity <= PRODUCT_LOW_STOCK_THRESHOLD) {
    return "low";
  }
  return "in";
}

export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

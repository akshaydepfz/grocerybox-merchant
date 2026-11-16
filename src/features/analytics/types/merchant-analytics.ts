export type MerchantAnalyticsPeriod = "7d" | "30d" | "90d";

export type MerchantAnalyticsKPIs = {
  revenue: number;
  orderCount: number;
  cancelledCount: number;
  avgOrderValue: number;
  uniqueCustomers: number;
  newCustomers: number;
  itemsSold: number;
  couponOrderCount: number;
};

export type MerchantAnalyticsDailyPoint = {
  date: string;
  revenue: number;
  orderCount: number;
};

export type MerchantAnalyticsBreakdownItem = {
  key: string;
  label: string;
  count: number;
  revenue: number;
};

export type MerchantAnalyticsTopProduct = {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitsSold: number;
  revenue: number;
  orderCount: number;
};

export type MerchantAnalyticsHourPoint = {
  hour: number;
  orderCount: number;
};

export type MerchantAnalyticsCatalogSnapshot = {
  activeProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
};

export type MerchantAnalyticsReport = {
  period: MerchantAnalyticsPeriod;
  rangeLabel: string;
  periodDays: number;
  currentStart: string;
  currentEnd: string;
  kpis: MerchantAnalyticsKPIs;
  previousKpis: MerchantAnalyticsKPIs;
  revenueSeries: MerchantAnalyticsDailyPoint[];
  ordersByStep: MerchantAnalyticsBreakdownItem[];
  paymentMethods: MerchantAnalyticsBreakdownItem[];
  fulfillment: MerchantAnalyticsBreakdownItem[];
  topProducts: MerchantAnalyticsTopProduct[];
  ordersByHour: MerchantAnalyticsHourPoint[];
  catalog: MerchantAnalyticsCatalogSnapshot;
};

function toNum(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toInt(value: unknown): number {
  const n = toNum(value);
  return Math.round(n);
}

function parseKpis(raw: Record<string, unknown>): MerchantAnalyticsKPIs {
  return {
    revenue: toNum(raw.revenue),
    orderCount: toInt(raw.order_count),
    cancelledCount: toInt(raw.cancelled_count),
    avgOrderValue: toNum(raw.avg_order_value),
    uniqueCustomers: toInt(raw.unique_customers),
    newCustomers: toInt(raw.new_customers),
    itemsSold: toNum(raw.items_sold),
    couponOrderCount: toInt(raw.coupon_order_count),
  };
}

function parseBreakdown(items: unknown): MerchantAnalyticsBreakdownItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      key: String(item.key ?? ""),
      label: String(item.label ?? item.key ?? ""),
      count: toInt(item.count),
      revenue: toNum(item.revenue),
    }));
}

export function merchantAnalyticsFromJson(
  raw: Record<string, unknown>,
): MerchantAnalyticsReport {
  const periodRaw = String(raw.period ?? "30d");
  const period =
    periodRaw === "7d" || periodRaw === "90d" ? periodRaw : "30d";

  const seriesRaw = Array.isArray(raw.revenue_series) ? raw.revenue_series : [];
  const revenueSeries = seriesRaw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      date: String(item.date ?? ""),
      revenue: toNum(item.revenue),
      orderCount: toInt(item.order_count),
    }));

  const topRaw = Array.isArray(raw.top_products) ? raw.top_products : [];
  const topProducts = topRaw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      productId: String(item.product_id ?? ""),
      name: String(item.name ?? ""),
      imageUrl:
        typeof item.image_url === "string" && item.image_url.trim()
          ? item.image_url.trim()
          : null,
      unitsSold: toNum(item.units_sold),
      revenue: toNum(item.revenue),
      orderCount: toInt(item.order_count),
    }));

  const hoursRaw = Array.isArray(raw.orders_by_hour) ? raw.orders_by_hour : [];
  const ordersByHour = hoursRaw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      hour: toInt(item.hour),
      orderCount: toInt(item.order_count),
    }));

  const catalogRaw =
    raw.catalog && typeof raw.catalog === "object"
      ? (raw.catalog as Record<string, unknown>)
      : {};

  const kpis =
    raw.kpis && typeof raw.kpis === "object"
      ? parseKpis(raw.kpis as Record<string, unknown>)
      : parseKpis({});
  const previousKpis =
    raw.previous_kpis && typeof raw.previous_kpis === "object"
      ? parseKpis(raw.previous_kpis as Record<string, unknown>)
      : parseKpis({});

  return {
    period,
    rangeLabel: String(raw.range_label ?? ""),
    periodDays: toInt(raw.period_days) || 30,
    currentStart: String(raw.current_start ?? ""),
    currentEnd: String(raw.current_end ?? ""),
    kpis,
    previousKpis,
    revenueSeries,
    ordersByStep: parseBreakdown(raw.orders_by_step),
    paymentMethods: parseBreakdown(raw.payment_methods),
    fulfillment: parseBreakdown(raw.fulfillment),
    topProducts,
    ordersByHour,
    catalog: {
      activeProducts: toInt(catalogRaw.active_products),
      lowStockCount: toInt(catalogRaw.low_stock_count),
      outOfStockCount: toInt(catalogRaw.out_of_stock_count),
    },
  };
}
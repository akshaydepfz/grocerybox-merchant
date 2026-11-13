/** Matches customer storefront `OrderTimelineStepId` and DB `current_step` check constraint. */
export type MerchantOrderTimelineStep =
  | "placed"
  | "confirmed"
  | "packing"
  | "out_for_delivery"
  | "delivered";

export type MerchantOrderPaymentStatus =
  | "paid"
  | "cod_pending"
  | "pending"
  | "failed";

export const MERCHANT_ORDER_STEPS: {
  id: MerchantOrderTimelineStep;
  title: string;
}[] = [
  { id: "placed", title: "Order placed" },
  { id: "confirmed", title: "Store confirmed" },
  { id: "packing", title: "Packing" },
  { id: "out_for_delivery", title: "Out for delivery" },
  { id: "delivered", title: "Delivered" },
];

export type MerchantOrderListItem = {
  id: string;
  orderNumber: string;
  customerPhone: string;
  placedAt: string;
  updatedAt: string;
  currentStep: MerchantOrderTimelineStep;
  paymentStatus: MerchantOrderPaymentStatus;
  paymentMethod: string;
  fulfillmentMethod: string;
  deliveryLabel: string;
  lineCount: number;
  itemCount: number;
  toPay: number;
};

export type MerchantOrderAddress = {
  fullName: string;
  phone: string;
  house: string;
  street: string;
  landmark?: string | null;
  city: string;
  state: string;
  pinCode: string;
  placeLabel?: string | null;
  lat?: number | null;
  lng?: number | null;
};

export type MerchantOrderLine = {
  productId: string;
  variantId?: string | null;
  name: string;
  unitLabel: string;
  quantity: number;
  unitPrice: number;
  unitMrp: number;
  lineSellingTotal: number;
  lineMrpTotal: number;
  imageUrl?: string | null;
};

export type MerchantOrderPricing = {
  lineCount: number;
  itemCount: number;
  mrpSubtotal: number;
  sellingSubtotal: number;
  productDiscount: number;
  deliveryFee: number;
  handlingFee: number;
  couponDiscount: number;
  tipAmount: number;
  toPay: number;
  totalSavings: number;
};

export type MerchantOrderDetail = {
  id: string;
  orderId: string;
  customerPhone: string;
  placedAt: string;
  updatedAt: string;
  paymentMethod: string;
  paymentStatus: MerchantOrderPaymentStatus;
  paymentDisplay: string;
  fulfillmentMethod: string;
  deliveryLabel: string;
  deliveryInstructions?: string | null;
  orderNotes?: string | null;
  currentStep: MerchantOrderTimelineStep;
  fulfillmentHub: string;
  etaWindow: string;
  address: MerchantOrderAddress;
  lines: MerchantOrderLine[];
  pricing: MerchantOrderPricing;
  toPay: number;
  totalSavings: number;
};

export type MerchantOrderListParams = {
  page?: number;
  limit?: number;
  search?: string;
  currentStep?: MerchantOrderTimelineStep;
  paymentStatus?: MerchantOrderPaymentStatus;
};

export type MerchantOrderListResult = {
  items: MerchantOrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function parseStep(raw: unknown): MerchantOrderTimelineStep {
  const step = String(raw ?? "placed").toLowerCase();
  if (MERCHANT_ORDER_STEPS.some((s) => s.id === step)) {
    return step as MerchantOrderTimelineStep;
  }
  return "placed";
}

function parsePaymentStatus(raw: unknown): MerchantOrderPaymentStatus {
  const value = String(raw ?? "pending");
  if (value === "paid" || value === "cod_pending" || value === "pending" || value === "failed") {
    return value;
  }
  return "pending";
}

export function merchantOrderListItemFromJson(
  raw: Record<string, unknown>,
): MerchantOrderListItem {
  return {
    id: String(raw.id ?? ""),
    orderNumber: String(raw.order_number ?? ""),
    customerPhone: String(raw.customer_phone ?? ""),
    placedAt: String(raw.placed_at ?? ""),
    updatedAt: String(raw.updated_at ?? ""),
    currentStep: parseStep(raw.current_step),
    paymentStatus: parsePaymentStatus(raw.payment_status),
    paymentMethod: String(raw.payment_method ?? ""),
    fulfillmentMethod: String(raw.fulfillment_method ?? ""),
    deliveryLabel: String(raw.delivery_label ?? ""),
    lineCount: typeof raw.line_count === "number" ? raw.line_count : 0,
    itemCount: typeof raw.item_count === "number" ? raw.item_count : 0,
    toPay: typeof raw.to_pay === "number" ? raw.to_pay : 0,
  };
}

function parseAddress(raw: unknown): MerchantOrderAddress {
  if (!raw || typeof raw !== "object") {
    return {
      fullName: "",
      phone: "",
      house: "",
      street: "",
      city: "",
      state: "",
      pinCode: "",
    };
  }
  const record = raw as Record<string, unknown>;
  return {
    fullName: String(record.full_name ?? ""),
    phone: String(record.phone ?? ""),
    house: String(record.house ?? ""),
    street: String(record.street ?? ""),
    landmark: record.landmark != null ? String(record.landmark) : null,
    city: String(record.city ?? ""),
    state: String(record.state ?? ""),
    pinCode: String(record.pin_code ?? ""),
    placeLabel: record.place_label != null ? String(record.place_label) : null,
    lat: typeof record.lat === "number" ? record.lat : null,
    lng: typeof record.lng === "number" ? record.lng : null,
  };
}

function parsePricing(raw: unknown): MerchantOrderPricing {
  if (!raw || typeof raw !== "object") {
    return {
      lineCount: 0,
      itemCount: 0,
      mrpSubtotal: 0,
      sellingSubtotal: 0,
      productDiscount: 0,
      deliveryFee: 0,
      handlingFee: 0,
      couponDiscount: 0,
      tipAmount: 0,
      toPay: 0,
      totalSavings: 0,
    };
  }
  const p = raw as Record<string, unknown>;
  return {
    lineCount: typeof p.line_count === "number" ? p.line_count : 0,
    itemCount: typeof p.item_count === "number" ? p.item_count : 0,
    mrpSubtotal: typeof p.mrp_subtotal === "number" ? p.mrp_subtotal : 0,
    sellingSubtotal: typeof p.selling_subtotal === "number" ? p.selling_subtotal : 0,
    productDiscount: typeof p.product_discount === "number" ? p.product_discount : 0,
    deliveryFee: typeof p.delivery_fee === "number" ? p.delivery_fee : 0,
    handlingFee: typeof p.handling_fee === "number" ? p.handling_fee : 0,
    couponDiscount: typeof p.coupon_discount === "number" ? p.coupon_discount : 0,
    tipAmount: typeof p.tip_amount === "number" ? p.tip_amount : 0,
    toPay: typeof p.to_pay === "number" ? p.to_pay : 0,
    totalSavings: typeof p.total_savings === "number" ? p.total_savings : 0,
  };
}

export function merchantOrderDetailFromJson(
  raw: Record<string, unknown>,
): MerchantOrderDetail {
  const pricing = parsePricing(raw.pricing);
  const linesRaw = Array.isArray(raw.lines) ? raw.lines : [];
  const lines = linesRaw
    .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
    .map((line) => ({
      productId: String(line.product_id ?? ""),
      variantId: line.variant_id != null ? String(line.variant_id) : null,
      name: String(line.name ?? ""),
      unitLabel: String(line.unit_label ?? ""),
      quantity: typeof line.quantity === "number" ? line.quantity : 0,
      unitPrice: typeof line.unit_price === "number" ? line.unit_price : 0,
      unitMrp: typeof line.unit_mrp === "number" ? line.unit_mrp : 0,
      lineSellingTotal: typeof line.line_selling_total === "number" ? line.line_selling_total : 0,
      lineMrpTotal: typeof line.line_mrp_total === "number" ? line.line_mrp_total : 0,
      imageUrl: line.image_url != null ? String(line.image_url) : null,
    }));

  return {
    id: String(raw.id ?? ""),
    orderId: String(raw.order_id ?? ""),
    customerPhone: String(raw.customer_phone ?? ""),
    placedAt: String(raw.placed_at ?? ""),
    updatedAt: String(raw.updated_at ?? ""),
    paymentMethod: String(raw.payment_method ?? ""),
    paymentStatus: parsePaymentStatus(raw.payment_status),
    paymentDisplay: String(raw.payment_display ?? ""),
    fulfillmentMethod: String(raw.fulfillment_method ?? ""),
    deliveryLabel: String(raw.delivery_label ?? ""),
    deliveryInstructions:
      raw.delivery_instructions != null ? String(raw.delivery_instructions) : null,
    orderNotes: raw.order_notes != null ? String(raw.order_notes) : null,
    currentStep: parseStep(raw.current_step),
    fulfillmentHub: String(raw.fulfillment_hub ?? ""),
    etaWindow: String(raw.eta_window ?? ""),
    address: parseAddress(raw.address),
    lines,
    pricing,
    toPay: pricing.toPay,
    totalSavings:
      typeof raw.total_savings === "number" ? raw.total_savings : pricing.totalSavings,
  };
}

export function parseOrderListData(data: unknown): MerchantOrderListResult {
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
      .map((item) => merchantOrderListItemFromJson(item)),
    pagination: {
      page: typeof paginationRaw.page === "number" ? paginationRaw.page : 1,
      limit: typeof paginationRaw.limit === "number" ? paginationRaw.limit : 20,
      total: typeof paginationRaw.total === "number" ? paginationRaw.total : 0,
      totalPages:
        typeof paginationRaw.total_pages === "number" ? paginationRaw.total_pages : 0,
    },
  };
}

export function orderStatusUpdateToJson(step: MerchantOrderTimelineStep): Record<string, string> {
  return { current_step: step };
}

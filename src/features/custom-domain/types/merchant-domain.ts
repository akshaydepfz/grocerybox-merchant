export type MerchantDomainType = "storefront" | "delivery";

export type MerchantDomainVerificationStatus =
  | "pending"
  | "verified"
  | "failed"
  | "removed";

export type MerchantDomainVerificationInstructions = {
  recordType: string;
  recordName: string;
  recordValue: string;
};

export type MerchantDomain = {
  id: string;
  domain: string;
  domainType: MerchantDomainType;
  verificationStatus: MerchantDomainVerificationStatus;
  isPrimary: boolean;
  createdAt: string;
  verification?: MerchantDomainVerificationInstructions;
};

export type MerchantDomainCreateInput = {
  domain: string;
  domainType: MerchantDomainType;
};

function optionalString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function normalizeDomainType(value: unknown): MerchantDomainType {
  const raw = String(value ?? "storefront").toLowerCase();
  return raw === "delivery" ? "delivery" : "storefront";
}

function normalizeVerificationStatus(
  value: unknown,
): MerchantDomainVerificationStatus {
  const raw = String(value ?? "pending").toLowerCase();
  switch (raw) {
    case "verified":
    case "active":
      return "verified";
    case "failed":
    case "error":
      return "failed";
    case "removed":
    case "deleted":
      return "removed";
    case "pending":
    default:
      return "pending";
  }
}

export function parseDomainVerificationInstructions(
  raw: Record<string, unknown>,
): MerchantDomainVerificationInstructions | undefined {
  const nested =
    raw.verification_instructions ??
    raw.verification ??
    raw.dns_verification ??
    raw.dns_instructions;
  const source =
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>)
      : raw;

  const recordName =
    optionalString(source.txt_record_name) ??
    optionalString(source.record_name) ??
    optionalString(source.dns_record_name) ??
    optionalString(source.host) ??
    optionalString(source.name);

  let recordValue =
    optionalString(source.txt_record_value) ??
    optionalString(source.record_value) ??
    optionalString(source.dns_record_value) ??
    optionalString(source.value);

  const token = optionalString(source.verification_token) ?? optionalString(source.token);
  if (!recordValue && token) {
    recordValue = token.includes("=") ? token : `grocerybox-verify=${token}`;
  }

  if (!recordName || !recordValue) {
    return undefined;
  }

  return {
    recordType: optionalString(source.record_type) ?? "TXT",
    recordName,
    recordValue,
  };
}

export function merchantDomainFromJson(
  raw: Record<string, unknown>,
): MerchantDomain {
  const statusRaw =
    raw.verification_status ?? raw.status ?? raw.verification_state;
  const domainTypeRaw = raw.domain_type ?? raw.type;
  const hostname = String(raw.domain ?? raw.hostname ?? raw.host ?? "").trim();

  const verification = parseDomainVerificationInstructions(raw);

  return {
    id: String(raw.id ?? ""),
    domain: hostname.toLowerCase(),
    domainType: normalizeDomainType(domainTypeRaw),
    verificationStatus: normalizeVerificationStatus(statusRaw),
    isPrimary: Boolean(raw.is_primary ?? raw.primary),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ""),
    verification,
  };
}

export function parseMerchantDomainListData(data: unknown): MerchantDomain[] {
  if (Array.isArray(data)) {
    return data
      .filter(
        (item): item is Record<string, unknown> =>
          item !== null && typeof item === "object",
      )
      .map((item) => merchantDomainFromJson(item));
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;
  const itemsRaw = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.domains)
      ? record.domains
      : [];

  return itemsRaw
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === "object",
    )
    .map((item) => merchantDomainFromJson(item));
}

export function domainCreateToJson(input: MerchantDomainCreateInput): {
  domain: string;
  domain_type: MerchantDomainType;
} {
  return {
    domain: input.domain.trim().toLowerCase(),
    domain_type: input.domainType,
  };
}

export function domainTypeLabel(type: MerchantDomainType): string {
  return type === "delivery" ? "Delivery" : "Storefront";
}

export function domainStatusLabel(
  status: MerchantDomainVerificationStatus,
): string {
  switch (status) {
    case "verified":
      return "Verified";
    case "failed":
      return "Failed";
    case "removed":
      return "Removed";
    case "pending":
    default:
      return "Pending";
  }
}
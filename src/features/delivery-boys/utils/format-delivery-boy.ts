import type { DeliveryBoyCommissionType } from "../types/merchant-delivery-boy";

export function formatDeliveryBoyPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function formatDeliveryBoyJoinedDate(isoDate: string): string {
  const date = new Date(
    isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`,
  );
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCommissionLabel(
  commissionType: DeliveryBoyCommissionType,
  commissionValue: number,
): string {
  if (commissionType === "fixed") {
    return `₹${commissionValue}/delivery`;
  }
  return `${commissionValue}% of delivery charges`;
}

export function commissionPreviewText(
  type: DeliveryBoyCommissionType,
  rawValue: string,
): string {
  const trimmed = rawValue.trim();
  const value = Number.parseFloat(trimmed);
  if (!trimmed || !Number.isFinite(value) || value <= 0) {
    return type === "fixed"
      ? "Enter an amount to preview commission"
      : "Enter a percentage to preview commission";
  }
  if (type === "fixed") {
    return `₹${value} per completed delivery`;
  }
  return `${value}% of eligible delivery charges`;
}

export function deliveryBoyInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;
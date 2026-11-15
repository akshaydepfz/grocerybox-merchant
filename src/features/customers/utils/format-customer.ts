export function formatCustomerDateTime(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function customerDisplayLabel(name: string, phone: string): string {
  const trimmed = name.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  return phone || "Customer";
}
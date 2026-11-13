export function formatProfileDate(isoDate: string | null | undefined): string {
  if (!isoDate?.trim()) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatProfileMoney(
  amount: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (amount == null) return "—";
  const code = currency?.trim() || "INR";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${code} ${amount}`;
  }
}

export function displayOrDash(value: string | null | undefined): string {
  const text = value?.trim();
  return text && text.length > 0 ? text : "—";
}

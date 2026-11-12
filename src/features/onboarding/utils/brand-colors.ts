/** Parses API / user hex into `#RRGGBB` (Flutter `colorFromHex`). */
export function colorFromHex(hex: string | null | undefined): string | null {
  if (!hex?.trim()) return null;
  let value = hex.trim();
  if (!value.startsWith("#")) value = `#${value}`;
  value = value.toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(value)) return value;
  if (/^#[0-9A-F]{8}$/.test(value)) return `#${value.slice(3)}`;
  return null;
}

/** Formats as `#RRGGBB` for the branding API (Flutter `colorToHex`). */
export function colorToHex(cssColor: string): string {
  const parsed = colorFromHex(cssColor);
  return (parsed ?? cssColor.trim()).toUpperCase();
}

export const BRANDING_QUICK_PICK_HEX = [
  "#16A34A",
  "#D4FF3F",
  "#FACC15",
  "#F97316",
  "#EF4444",
] as const;

export const DEFAULT_PRIMARY_HEX = BRANDING_QUICK_PICK_HEX[0];
export const DEFAULT_SECONDARY_HEX = BRANDING_QUICK_PICK_HEX[1];

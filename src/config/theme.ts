/**
 * GroceryBox brand design tokens (JS/TS consumers).
 * CSS variables are defined in `src/app/globals.css`.
 */
export const groceryBoxTheme = {
  colors: {
    primaryDarkGreen: "#14532D",
    secondaryGreen: "#16A34A",
    accentLime: "#D4FF3F",
    background: "#FFFFFF",
    backgroundSecondary: "#F8FAF8",
    textPrimary: "#171717",
    textSecondary: "#737373",
    border: "#E5E7EB",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
  },
} as const;

export type GroceryBoxTheme = typeof groceryBoxTheme;

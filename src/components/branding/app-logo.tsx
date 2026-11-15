import Image from "next/image";

import { APP_LOGO_SRC } from "@/config/branding";
import { cn } from "@/lib/utils";

type AppLogoImageProps = {
  size: number;
  className?: string;
  alt?: string;
  priority?: boolean;
};

export function AppLogoImage({
  size,
  className,
  alt = "Grocerybox.in",
  priority,
}: AppLogoImageProps) {
  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={APP_LOGO_SRC}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority={priority}
      />
    </span>
  );
}

const GROCERYBOX_BRAND = {
  name: "Grocerybox",
  alt: "Grocerybox.in",
} as const;

const GROCERY_BRAND = {
  name: "Grocery",
  alt: "Grocery.in",
} as const;

type GroceryBrandLogoProps = {
  size?: "compact" | "default";
  className?: string;
  variant?: "grocery-in" | "grocerybox-in";
};

export function GroceryBrandLogo({
  size = "default",
  className,
  variant = "grocerybox-in",
}: GroceryBrandLogoProps) {
  const markSize = size === "compact" ? 36 : 40;
  const text = size === "compact" ? "text-xl" : "text-2xl";
  const brand =
    variant === "grocerybox-in" ? GROCERYBOX_BRAND : GROCERY_BRAND;

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <AppLogoImage size={markSize} priority alt={brand.alt} />
      <span
        className={cn(
          "font-bold tracking-tight text-gb-onboard-slate-900",
          text,
        )}
      >
        {brand.name}
        <span className="font-extrabold text-gb-onboard-lime-500">.in</span>
      </span>
    </div>
  );
}

export function GroceryBrandLogoOnboarding({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex min-w-0 items-center gap-1.5 sm:gap-2", className)}>
      <span className="shrink-0 origin-left scale-[0.88] sm:scale-100">
        <AppLogoImage size={32} alt="Grocerybox.in" />
      </span>
      <span className="truncate text-base font-bold tracking-tight text-gb-mo-gray-900 sm:text-2xl">
        Grocerybox
        <span className="text-gb-onboard-lime-500">.in</span>
      </span>
    </div>
  );
}

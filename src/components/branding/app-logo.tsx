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
  alt = "Grocery.in",
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

type GroceryBrandLogoProps = {
  size?: "compact" | "default";
  className?: string;
};

export function GroceryBrandLogo({
  size = "default",
  className,
}: GroceryBrandLogoProps) {
  const markSize = size === "compact" ? 36 : 40;
  const text = size === "compact" ? "text-xl" : "text-2xl";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <AppLogoImage size={markSize} priority />
      <span
        className={cn(
          "font-bold tracking-tight text-gb-onboard-slate-900",
          text,
        )}
      >
        Grocery
        <span className="font-extrabold text-gb-onboard-lime-500">.in</span>
      </span>
    </div>
  );
}

export function GroceryBrandLogoOnboarding({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <AppLogoImage size={32} />
      <span className="text-2xl font-bold tracking-tight text-gb-mo-gray-900">
        Grocery<span className="text-gb-onboard-lime-500">.in</span>
      </span>
    </div>
  );
}

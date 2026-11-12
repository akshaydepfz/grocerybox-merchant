import { cn } from "@/lib/utils";

import {
  GroceryAnimatedLoader,
  type AnimatedLoaderTheme,
} from "./animated-loader";

type LoadingIndicatorProps = {
  className?: string;
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
  theme?: AnimatedLoaderTheme;
};

export function LoadingIndicator({
  className,
  label = "Loading",
  sublabel,
  fullScreen = false,
  theme = "light",
}: LoadingIndicatorProps) {
  return (
    <GroceryAnimatedLoader
      className={cn(className)}
      label={label}
      sublabel={sublabel}
      fullScreen={fullScreen}
      theme={theme}
      showLogo={false}
    />
  );
}

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingIndicatorProps = {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
} as const;

export function LoadingIndicator({
  className,
  label = "Loading",
  size = "md",
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className={cn("animate-spin text-gb-secondary", sizeClasses[size])}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

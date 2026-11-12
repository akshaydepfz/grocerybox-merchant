import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  action?: ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  message = "We could not complete this action. Please try again.",
  onRetry,
  retryLabel = "Try again",
  className,
  action,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-gb-border bg-gb-bg px-6 py-12 text-center shadow-gb-sm",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="mb-4 size-10 text-destructive" aria-hidden />
      <h3 className="text-lg font-semibold text-gb-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-gb-text-secondary">{message}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}

import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title = "No data yet",
  description = "Content will appear here once available.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-gb-border bg-gb-bg px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 text-gb-text-secondary" aria-hidden>
        {icon ?? <Inbox className="size-10" />}
      </div>
      <h3 className="text-base font-semibold text-gb-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-gb-text-secondary">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

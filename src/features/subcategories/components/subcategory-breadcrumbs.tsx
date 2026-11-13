import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { dashboardRoutePrefix } from "@/config/routes";
import { cn } from "@/lib/utils";

type Crumb = {
  label: string;
  href?: string;
};

type SubcategoryBreadcrumbsProps = {
  items: Crumb[];
  className?: string;
};

export function SubcategoryBreadcrumbs({
  items,
  className,
}: SubcategoryBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-1 text-xs text-[#6b7280]",
        className,
      )}
    >
      <Link
        href={dashboardRoutePrefix}
        className="font-medium transition hover:text-[#16a34a]"
      >
        Dashboard
      </Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1">
          <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
          {item.href ? (
            <Link
              href={item.href}
              className="font-medium transition hover:text-[#16a34a]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-[#1a1f2e]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

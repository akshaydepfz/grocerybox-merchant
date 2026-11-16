"use client";

import Link from "next/link";

import { ProductThumbnail } from "@/features/products/components/product-thumbnail";
import { dashboardRoutePrefix } from "@/config/routes";

import type { MerchantAnalyticsTopProduct } from "../types/merchant-analytics";
import { formatAnalyticsInr } from "../utils/format-analytics";

type AnalyticsTopProductsProps = {
  products: MerchantAnalyticsTopProduct[];
};

export function AnalyticsTopProducts({ products }: AnalyticsTopProductsProps) {
  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#9ca3af]">
        Top sellers appear once orders include product lines.
      </p>
    );
  }

  const maxRevenue = products[0]?.revenue ?? 1;

  return (
    <ul className="flex flex-col divide-y divide-[#f0f1f4]">
      {products.map((product, index) => {
        const pct = Math.round((product.revenue / maxRevenue) * 100);
        return (
          <li key={`${product.productId}-${index}`} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f6] text-xs font-bold text-[#6b7280]">
              {index + 1}
            </span>
            <ProductThumbnail imageUrl={product.imageUrl} name={product.name} />
            <div className="min-w-0 flex-1">
              <Link
                href={`${dashboardRoutePrefix}/products/${product.productId}`}
                className="line-clamp-1 text-sm font-semibold text-[#1a1f2e] hover:text-[#16a34a] hover:underline"
              >
                {product.name}
              </Link>
              <p className="mt-0.5 text-xs text-[#6b7280]">
                {product.unitsSold.toLocaleString("en-IN", { maximumFractionDigits: 1 })}{" "}
                units · {product.orderCount} orders
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f3f4f6]">
                <div
                  className="h-full rounded-full bg-[#9333ea]/70"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <p className="shrink-0 text-sm font-bold tabular-nums text-[#1a1f2e]">
              {formatAnalyticsInr(product.revenue)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

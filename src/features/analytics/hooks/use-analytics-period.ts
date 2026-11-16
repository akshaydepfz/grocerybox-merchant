"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import type { MerchantAnalyticsPeriod } from "../types/merchant-analytics";

const VALID: MerchantAnalyticsPeriod[] = ["7d", "30d", "90d"];

function parsePeriod(raw: string | null): MerchantAnalyticsPeriod {
  if (raw === "7d" || raw === "90d") return raw;
  return "30d";
}

export function useAnalyticsPeriod() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const period = useMemo(
    () => parsePeriod(searchParams.get("period")),
    [searchParams],
  );

  const setPeriod = useCallback(
    (next: MerchantAnalyticsPeriod) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "30d") {
        params.delete("period");
      } else {
        params.set("period", next);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { period, setPeriod, options: VALID };
}
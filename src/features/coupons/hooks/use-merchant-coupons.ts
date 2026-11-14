"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import type { MerchantCoupon, MerchantCouponDraft } from "../types/merchant-coupon";

const STORAGE_KEY = "grocerybox-merchant-coupons-v1";
const COUPON_STORE_EVENT = "grocerybox-merchant-coupons-changed";

const EMPTY_COUPONS: MerchantCoupon[] = [];

function isMerchantCoupon(item: unknown): item is MerchantCoupon {
  if (typeof item !== "object" || item === null) {
    return false;
  }
  const c = item as MerchantCoupon;
  return (
    typeof c.id === "string" &&
    typeof c.code === "string" &&
    typeof c.title === "string" &&
    (c.discountType === "percent" || c.discountType === "flat") &&
    typeof c.discountValue === "number" &&
    typeof c.usedCount === "number" &&
    typeof c.isActive === "boolean"
  );
}

function parseStoredCoupons(raw: string | null): MerchantCoupon[] {
  if (!raw) {
    return EMPTY_COUPONS;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return EMPTY_COUPONS;
    }
    const coupons = parsed.filter(isMerchantCoupon);
    return coupons.length === 0 ? EMPTY_COUPONS : coupons;
  } catch {
    return EMPTY_COUPONS;
  }
}

function readStoredCoupons(): MerchantCoupon[] {
  if (typeof window === "undefined") {
    return EMPTY_COUPONS;
  }
  return parseStoredCoupons(window.localStorage.getItem(STORAGE_KEY));
}

let cachedStorageRaw: string | null | undefined;
let cachedSnapshot: MerchantCoupon[] = EMPTY_COUPONS;

function invalidateCouponSnapshot() {
  cachedStorageRaw = undefined;
}

function persistCoupons(coupons: MerchantCoupon[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  invalidateCouponSnapshot();
}

function notifyCouponStore() {
  window.dispatchEvent(new Event(COUPON_STORE_EVENT));
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => {
    invalidateCouponSnapshot();
    onStoreChange();
  };
  window.addEventListener(COUPON_STORE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(COUPON_STORE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot(): MerchantCoupon[] {
  if (typeof window === "undefined") {
    return EMPTY_COUPONS;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (cachedStorageRaw !== undefined && raw === cachedStorageRaw) {
    return cachedSnapshot;
  }
  cachedStorageRaw = raw;
  cachedSnapshot = parseStoredCoupons(raw);
  return cachedSnapshot;
}

function getServerSnapshot(): MerchantCoupon[] {
  return EMPTY_COUPONS;
}

export function useMerchantCoupons() {
  const coupons = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const addCoupon = useCallback((draft: MerchantCouponDraft) => {
    const next: MerchantCoupon = {
      ...draft,
      id: crypto.randomUUID(),
      code: draft.code.trim().toUpperCase(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [next, ...readStoredCoupons()];
    persistCoupons(updated);
    notifyCouponStore();
    return next;
  }, []);

  const removeCoupon = useCallback((couponId: string) => {
    const updated = readStoredCoupons().filter((c) => c.id !== couponId);
    persistCoupons(updated);
    notifyCouponStore();
  }, []);

  const toggleCouponActive = useCallback(
    (couponId: string, isActive: boolean) => {
      const updated = readStoredCoupons().map((c) =>
        c.id === couponId ? { ...c, isActive } : c,
      );
      persistCoupons(updated);
      notifyCouponStore();
    },
    [],
  );

  return {
    coupons,
    hydrated,
    addCoupon,
    removeCoupon,
    toggleCouponActive,
  };
}
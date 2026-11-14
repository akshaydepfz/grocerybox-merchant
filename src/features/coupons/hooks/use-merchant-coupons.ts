"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { MerchantCoupon, MerchantCouponDraft } from "../types/merchant-coupon";

const STORAGE_KEY = "grocerybox-merchant-coupons-v1";
const COUPON_STORE_EVENT = "grocerybox-merchant-coupons-changed";

function readStoredCoupons(): MerchantCoupon[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is MerchantCoupon =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as MerchantCoupon).id === "string" &&
        typeof (item as MerchantCoupon).code === "string",
    );
  } catch {
    return [];
  }
}

function persistCoupons(coupons: MerchantCoupon[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
}

function notifyCouponStore() {
  window.dispatchEvent(new Event(COUPON_STORE_EVENT));
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => onStoreChange();
  window.addEventListener(COUPON_STORE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(COUPON_STORE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot(): MerchantCoupon[] {
  return readStoredCoupons();
}

function getServerSnapshot(): MerchantCoupon[] {
  return [];
}

function getHydratedSnapshot(): boolean {
  return true;
}

function getHydratedServerSnapshot(): boolean {
  return false;
}

export function useMerchantCoupons() {
  const coupons = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const hydrated = useSyncExternalStore(
    subscribe,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

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
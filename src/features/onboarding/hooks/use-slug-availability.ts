"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { checkSlugAvailability } from "../services/store-identity-service";
import type { StoreSubdomainAvailability } from "../types/store-identity";
import {
  normalizeSubdomain,
  validateSubdomainFormat,
} from "../validators/store-identity-validator";

const SLUG_DEBOUNCE_MS = 450;

export function useSlugAvailability() {
  const [availability, setAvailability] =
    useState<StoreSubdomainAvailability>("idle");
  const [availabilityFor, setAvailabilityFor] = useState("");
  const generationRef = useRef(0);
  const availabilityForRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleCheck = useCallback((rawSubdomain: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const normalized = normalizeSubdomain(rawSubdomain);
    availabilityForRef.current = normalized;
    setAvailabilityFor(normalized);

    const formatError = validateSubdomainFormat(normalized);
    if (formatError) {
      generationRef.current += 1;
      setAvailability(normalized.length === 0 ? "idle" : "invalid");
      return;
    }

    setAvailability("checking");
    const generation = ++generationRef.current;

    timerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const result = await checkSlugAvailability(normalized);
          if (generation !== generationRef.current) {
            return;
          }
          if (availabilityForRef.current !== normalized) {
            return;
          }
          setAvailability(result.available ? "available" : "unavailable");
        } catch {
          if (generation !== generationRef.current) {
            return;
          }
          setAvailability("invalid");
        }
      })();
    }, SLUG_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const canSubmitSlug =
    availability === "available" && availabilityFor.length > 0;

  const markUnavailable = useCallback(() => {
    setAvailability("unavailable");
  }, []);

  return {
    availability,
    availabilityFor,
    scheduleCheck,
    canSubmitSlug,
    markUnavailable,
  };
}

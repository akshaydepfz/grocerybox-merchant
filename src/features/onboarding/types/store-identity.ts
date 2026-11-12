export type StoreIdentityFormValues = {
  storeName: string;
  subdomain: string;
  description: string;
};

export type StoreIdentityData = {
  storeName: string;
  subdomain: string;
  description: string;
};

export type SlugAvailabilityData = {
  slug: string;
  available: boolean;
};

export type StoreSubdomainAvailability =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "invalid";

export function storeIdentityToJson(
  values: StoreIdentityFormValues,
): Record<string, string> {
  return {
    store_name: values.storeName,
    subdomain: values.subdomain,
    description: values.description,
  };
}

export function storeIdentityFromEnvelopeData(
  data: Record<string, unknown>,
): StoreIdentityData {
  const store = data.store as Record<string, unknown>;
  return {
    storeName: (store.store_name as string) ?? "",
    subdomain: (store.subdomain as string) ?? "",
    description: (store.description as string) ?? "",
  };
}

export function slugAvailabilityFromEnvelopeData(
  data: Record<string, unknown>,
): SlugAvailabilityData {
  return {
    slug: (data.slug as string) ?? "",
    available: (data.available as boolean) ?? false,
  };
}

export const defaultStoreIdentityFormValues = (): StoreIdentityFormValues => ({
  storeName: "",
  subdomain: "",
  description: "",
});

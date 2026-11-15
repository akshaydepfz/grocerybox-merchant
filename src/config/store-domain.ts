/** Public storefront host segment (Flutter parity). */
export const GROCERYBOX_STORE_DOMAIN = "grocerybox.in" as const;

/** Suffix shown beside subdomain fields (e.g. `.grocerybox.in`). */
export const GROCERYBOX_STORE_DOMAIN_SUFFIX = `.${GROCERYBOX_STORE_DOMAIN}` as const;

/** Branded product name for checkout and onboarding copy. */
export const GROCERYBOX_BRAND_DISPLAY = "Grocerybox.in" as const;

export function merchantStoreSubdomainHost(subdomain: string): string {
  const slug = subdomain.trim().toLowerCase();
  if (!slug) {
    return `subdomain.${GROCERYBOX_STORE_DOMAIN}`;
  }
  return `${slug}.${GROCERYBOX_STORE_DOMAIN}`;
}

export function merchantStorePublicUrl(subdomain: string): string {
  const slug = subdomain.trim().toLowerCase();
  if (!slug) {
    return `https://${GROCERYBOX_STORE_DOMAIN}`;
  }
  return `https://${slug}.${GROCERYBOX_STORE_DOMAIN}`;
}

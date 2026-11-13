/** Public storefront host segment (Flutter parity). */
export const GROCERYBOX_STORE_DOMAIN = "grocerybox.in" as const;

export function merchantStorePublicUrl(subdomain: string): string {
  const slug = subdomain.trim().toLowerCase();
  if (!slug) {
    return `https://${GROCERYBOX_STORE_DOMAIN}`;
  }
  return `https://${slug}.${GROCERYBOX_STORE_DOMAIN}`;
}

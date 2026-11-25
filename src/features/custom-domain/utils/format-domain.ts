export function formatDomainCreatedDate(iso: string): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export const STOREFRONT_DOMAIN_EXAMPLE = "www.lefafa.in";
export const DELIVERY_DOMAIN_EXAMPLE = "delivery.lefafa.in";
/** Hostname with at least one dot and a TLD-like final label (e.g. www.example.com). */
const HOSTNAME_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

export function normalizeDomainHostname(raw: string): string {
  let value = raw.trim().toLowerCase();

  value = value.replace(/^https?:\/\//i, "");

  const slash = value.indexOf("/");
  if (slash >= 0) {
    value = value.slice(0, slash);
  }
  const question = value.indexOf("?");
  if (question >= 0) {
    value = value.slice(0, question);
  }
  const hash = value.indexOf("#");
  if (hash >= 0) {
    value = value.slice(0, hash);
  }

  const colon = value.lastIndexOf(":");
  if (colon > 0 && !value.includes("]")) {
    const portPart = value.slice(colon + 1);
    if (/^\d+$/.test(portPart)) {
      value = value.slice(0, colon);
    }
  }

  if (value.endsWith(".")) {
    value = value.slice(0, -1);
  }

  return value;
}

/** Returns a merchant-friendly error message, or null when valid. */
export function validateDomainHostname(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "Domain name is required.";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return "Remove http:// or https:// — enter only the hostname (e.g. www.example.com).";
  }
  if (trimmed.includes("/")) {
    return "Enter only the hostname, not a URL path.";
  }
  if (trimmed.includes("?") || trimmed.includes("#")) {
    return "Query strings and fragments are not allowed.";
  }
  if (/:\d+$/.test(trimmed) || (trimmed.includes(":") && !trimmed.includes("]"))) {
    return "Do not include a port number.";
  }

  const hostname = normalizeDomainHostname(trimmed);
  if (!hostname) {
    return "Domain name is required.";
  }
  if (hostname.length > 253) {
    return "Domain name is too long.";
  }
  if (!HOSTNAME_PATTERN.test(hostname)) {
    return "Enter a valid hostname like www.example.com or delivery.example.com.";
  }

  return null;
}
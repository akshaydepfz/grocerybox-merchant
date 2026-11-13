export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }
  const deltaMs = Date.now() - date.getTime();
  const deltaSec = Math.round(deltaMs / 1000);
  if (deltaSec < 60) {
    return "Just now";
  }
  const deltaMin = Math.round(deltaSec / 60);
  if (deltaMin < 60) {
    return deltaMin === 1 ? "1 minute ago" : `${deltaMin} minutes ago`;
  }
  const deltaHours = Math.round(deltaMin / 60);
  if (deltaHours < 24) {
    return deltaHours === 1 ? "1 hour ago" : `${deltaHours} hours ago`;
  }
  const deltaDays = Math.round(deltaHours / 24);
  if (deltaDays < 7) {
    return deltaDays === 1 ? "Yesterday" : `${deltaDays} days ago`;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose Plan",
};

/** Flutter `PlanScreen` — subscription step (placeholder). */
export default function PlanPlaceholderPage() {
  return (
    <p className="min-h-screen bg-white p-8 text-sm text-gb-text-secondary">
      Plan selection will be implemented from the Flutter reference next.
    </p>
  );
}

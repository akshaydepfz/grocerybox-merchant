import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPlaceholderPage() {
  return (
    <p className="text-sm text-gb-text-secondary">
      Dashboard features will be implemented in a follow-up task.
    </p>
  );
}

import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
  title?: string;
};

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gb-bg-secondary">
      <aside className="hidden w-64 shrink-0 border-r border-gb-border bg-gb-bg md:block">
        <div className="flex h-14 items-center border-b border-gb-border px-5">
          <span className="text-sm font-semibold text-gb-primary">GroceryBox</span>
        </div>
        <nav className="p-4 text-sm text-gb-text-secondary" aria-label="Main">
          {/* Navigation items added with dashboard features */}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-gb-border bg-gb-bg px-6">
          {title ? (
            <h1 className="text-base font-semibold text-gb-text-primary">{title}</h1>
          ) : (
            <span className="text-sm text-gb-text-secondary">Dashboard</span>
          )}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

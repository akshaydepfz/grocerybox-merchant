import type { ReactNode } from "react";

type OnboardingLayoutProps = {
  children: ReactNode;
  stepLabel?: string;
};

export function OnboardingLayout({ children, stepLabel }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gb-bg-secondary">
      <header className="border-b border-gb-border bg-gb-bg px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-semibold text-gb-primary">GroceryBox</span>
          {stepLabel ? (
            <span className="text-xs font-medium text-gb-text-secondary">
              {stepLabel}
            </span>
          ) : null}
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-6 py-10">{children}</main>
    </div>
  );
}

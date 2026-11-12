import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gb-bg-secondary lg:flex-row">
      <aside className="hidden w-full max-w-md flex-col justify-between border-r border-gb-border bg-gb-primary p-10 text-white lg:flex">
        <div>
          <p className="text-sm font-medium tracking-wide text-white/80">
            GroceryBox
          </p>
          <h1 className="mt-6 text-3xl font-semibold leading-tight">
            Merchant workspace
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            Manage your store, orders, and onboarding in one place.
          </p>
        </div>
        <p className="text-xs text-white/60">© GroceryBox</p>
      </aside>
      <main className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {(title || description) && (
            <header className="mb-8 space-y-2 text-center lg:text-left">
              {title ? (
                <h2 className="text-2xl font-semibold text-gb-text-primary">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="text-sm text-gb-text-secondary">{description}</p>
              ) : null}
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

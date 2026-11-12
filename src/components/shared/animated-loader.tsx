"use client";

import { AppLogoImage } from "@/components/branding/app-logo";
import { cn } from "@/lib/utils";

export type AnimatedLoaderTheme = "light" | "dashboard" | "dark";

type GroceryAnimatedLoaderProps = {
  className?: string;
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
  theme?: AnimatedLoaderTheme;
  showLogo?: boolean;
};

const themeClasses: Record<
  AnimatedLoaderTheme,
  {
    shell: string;
    card: string;
    title: string;
    sub: string;
    track: string;
    bar: string;
    ring: string;
    dot: string;
  }
> = {
  light: {
    shell: "bg-gb-bg-secondary",
    card: "border-gb-border bg-white shadow-gb-md",
    title: "text-gb-text-primary",
    sub: "text-gb-text-secondary",
    track: "bg-gb-mo-gray-100",
    bar: "from-gb-secondary via-gb-accent to-gb-secondary",
    ring: "text-gb-secondary",
    dot: "bg-gb-secondary",
  },
  dashboard: {
    shell: "bg-[#f5f6f8]",
    card: "border-[#eceef2] bg-white shadow-[0_8px_30px_rgb(0_0_0_/0.06)]",
    title: "text-[#1a1f2e]",
    sub: "text-[#6b7280]",
    track: "bg-[#eef0f4]",
    bar: "from-[#16a34a] via-[#bef264] to-[#16a34a]",
    ring: "text-[#16a34a]",
    dot: "bg-[#16a34a]",
  },
  dark: {
    shell: "bg-[#0a3d32]",
    card: "border-white/10 bg-[#062f27] shadow-none",
    title: "text-white",
    sub: "text-white/55",
    track: "bg-white/10",
    bar: "from-[#bef264] via-white to-[#bef264]",
    ring: "text-[#bef264]",
    dot: "bg-[#bef264]",
  },
};

export function GroceryAnimatedLoader({
  className,
  label = "Loading",
  sublabel,
  fullScreen = false,
  theme = "dashboard",
  showLogo = true,
}: GroceryAnimatedLoaderProps) {
  const t = themeClasses[theme];

  const content = (
    <div
      className={cn(
        "gb-loader-enter relative flex w-full max-w-sm flex-col items-center px-8 py-10",
        t.card,
        fullScreen ? "rounded-3xl border" : "rounded-2xl border",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {showLogo ? (
        <div className="relative mb-6 flex size-20 items-center justify-center">
          <svg
            className={cn("gb-loader-orbit absolute inset-0 size-full", t.ring)}
            viewBox="0 0 80 80"
            aria-hidden
          >
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="56 158"
              opacity={0.35}
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="56 158"
              className="gb-loader-orbit-stroke"
            />
          </svg>
          <div className="gb-loader-logo-pulse relative z-10 rounded-2xl bg-white p-2 shadow-sm">
            <AppLogoImage size={44} priority />
          </div>
        </div>
      ) : null}

      <p className={cn("text-center text-sm font-semibold", t.title)}>{label}</p>
      {sublabel ? (
        <p className={cn("mt-1 text-center text-xs", t.sub)}>{sublabel}</p>
      ) : null}

      <div
        className={cn("mt-6 h-1.5 w-full overflow-hidden rounded-full", t.track)}
      >
        <div
          className={cn(
            "gb-loader-shimmer h-full w-2/5 rounded-full bg-gradient-to-r",
            t.bar,
          )}
        />
      </div>

      <div className="mt-5 flex items-center gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("gb-loader-dot size-1.5 rounded-full", t.dot)}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={cn(
          "flex min-h-screen items-center justify-center p-6",
          t.shell,
        )}
      >
        {content}
      </div>
    );
  }

  return <div className="flex justify-center py-10">{content}</div>;
}

"use client";

import { Bell, ChevronDown } from "lucide-react";

import { AppLogoImage } from "@/components/branding/app-logo";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function displayNameFromEmail(email: string | undefined): string {
  if (!email) return "Merchant";
  const local = email.split("@")[0] ?? email;
  const first = local.split(/[._-]/)[0] ?? local;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function DashboardHeader({ className }: { className?: string }) {
  const session = useAuthStore((s) => s.session);
  const name = displayNameFromEmail(session?.email);
  const greeting = greetingForHour(new Date().getHours());

  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1f2e]">
          {greeting}, {name} 👋
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-2xl border border-[#e8eaef] bg-white px-3 py-2 shadow-sm transition hover:bg-[#fafbfc]"
          disabled
        >
          <AppLogoImage size={32} className="rounded-lg" />
          <div className="text-left">
            <p className="text-xs font-semibold text-[#1a1f2e]">Fresh Mart</p>
            <p className="text-[10px] text-[#9ca3af]">freshmart.grocery.in</p>
          </div>
          <ChevronDown className="size-4 text-[#9ca3af]" />
        </button>

        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-xl border border-[#e8eaef] bg-white shadow-sm"
          aria-label="Notifications"
          disabled
        >
          <Bell className="size-[18px] text-[#4b5563]" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
        </button>

        <div
          className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#16a34a] to-[#0a3d32] text-sm font-semibold text-white ring-2 ring-white"
          title={session?.email ?? "Profile"}
        >
          {name.charAt(0)}
        </div>
      </div>
    </header>
  );
}

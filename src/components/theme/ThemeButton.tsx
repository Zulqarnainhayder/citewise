"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { useTheme } from "./useTheme";

/** Compact one-tap toggle for small spaces (mobile bar, login page). */
export function ThemeButton({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  function toggle() {
    const isDark = document.documentElement.classList.contains("dark");
    // Flip what is currently on screen, regardless of the saved choice.
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark mode"
      title={`Theme: ${theme}`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-200 dark:hover:bg-brand-800 ${className}`}
    >
      <SunIcon className="hidden h-[18px] w-[18px] dark:block" />
      <MoonIcon className="h-[18px] w-[18px] dark:hidden" />
    </button>
  );
}

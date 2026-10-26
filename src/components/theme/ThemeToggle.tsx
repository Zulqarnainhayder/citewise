"use client";

import type { ComponentType } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/icons";
import type { Theme } from "@/lib/theme";
import { useTheme } from "./useTheme";

const options: { value: Theme; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: MonitorIcon },
];

/** Three-way switch: Light, Dark or follow the system. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={`grid grid-cols-3 gap-1 rounded-xl bg-brand-100 p-1 dark:bg-brand-900 ${className}`}
    >
      {options.map(({ value, label, Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`flex items-center justify-center rounded-lg py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 ${
              selected
                ? "bg-white text-brand-900 shadow-sm dark:bg-brand-700 dark:text-white"
                : "text-brand-500 hover:text-brand-800 dark:text-brand-400 dark:hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

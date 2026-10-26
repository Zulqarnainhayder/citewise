"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  THEME_EVENT,
  THEME_KEY,
  applyTheme,
  getStoredTheme,
  type Theme,
} from "@/lib/theme";

function subscribe(onChange: () => void) {
  const media = matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    // Follow the OS when the user has chosen "System".
    if (getStoredTheme() === "system") applyTheme("system");
    onChange();
  };

  window.addEventListener("storage", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  media.addEventListener("change", onSystemChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
    media.removeEventListener("change", onSystemChange);
  };
}

/** Current theme choice plus a setter that persists it and updates the page. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, getStoredTheme, () => "system");

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage can be blocked; the choice still applies for this visit.
    }
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return { theme, setTheme };
}

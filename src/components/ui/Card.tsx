import type { HTMLAttributes } from "react";

/** The standard surface used for panels, lists and stat strips. */
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-brand-200 bg-white shadow-sm dark:border-brand-800 dark:bg-brand-900 ${className}`}
      {...props}
    />
  );
}

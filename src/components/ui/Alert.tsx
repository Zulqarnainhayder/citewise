import type { ReactNode } from "react";

type Variant = "error" | "warning" | "success";

const styles: Record<Variant, string> = {
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
};

export function Alert({
  variant,
  children,
}: {
  variant: Variant;
  children: ReactNode;
}) {
  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles[variant]}`}
    >
      {children}
    </p>
  );
}

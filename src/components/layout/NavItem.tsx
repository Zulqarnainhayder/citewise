import Link from "next/link";
import type { ComponentType } from "react";

type NavItemProps = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  active?: boolean;
  soon?: boolean;
};

const base = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition";

export function NavItem({ label, icon: Icon, href, active, soon }: NavItemProps) {
  if (soon || !href) {
    return (
      <span
        aria-disabled="true"
        className={`${base} cursor-not-allowed text-brand-400 dark:text-brand-500`}
      >
        <Icon className="h-[18px] w-[18px]" />
        <span className="flex-1">{label}</span>
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-500 dark:bg-brand-800 dark:text-brand-400">
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${base} ${
        active
          ? "bg-accent-50 text-accent-700 dark:bg-accent-700/15 dark:text-accent-300"
          : "text-brand-600 hover:bg-brand-100 hover:text-brand-900 dark:text-brand-300 dark:hover:bg-brand-900 dark:hover:text-white"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </Link>
  );
}

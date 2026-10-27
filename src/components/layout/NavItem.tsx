"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItemProps = {
  label: string;
  /** An element, not a component: this runs on the client, the sidebar on the server. */
  icon: ReactNode;
  /** Omit (or set `soon`) for pages that are not built yet. */
  href?: string;
  soon?: boolean;
};

const base = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition";

export function NavItem({ label, icon, href, soon }: NavItemProps) {
  const pathname = usePathname();

  if (soon || !href) {
    return (
      <span
        aria-disabled="true"
        className={`${base} cursor-not-allowed text-brand-400 dark:text-brand-500`}
      >
        {icon}
        <span className="flex-1">{label}</span>
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-500 dark:bg-brand-800 dark:text-brand-400">
          Soon
        </span>
      </span>
    );
  }

  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${base} ${
        active
          ? "bg-accent-100/70 text-accent-700 dark:bg-accent-700/15 dark:text-accent-300"
          : "text-brand-600 hover:bg-brand-200/60 hover:text-brand-900 dark:text-brand-300 dark:hover:bg-brand-800 dark:hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

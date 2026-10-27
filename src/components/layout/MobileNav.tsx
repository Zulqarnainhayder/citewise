"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatIcon, FolderIcon, LayersIcon, SettingsIcon } from "@/components/icons";

const tabs = [
  { href: "/", label: "Documents", Icon: FolderIcon },
  { href: "/chat", label: "Chat", Icon: ChatIcon },
  { href: "/workspaces", label: "Workspaces", Icon: LayersIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

/** Page switcher for small screens, where the sidebar is hidden. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex h-12 border-b border-brand-200 bg-brand-50/95 backdrop-blur dark:border-brand-800 dark:bg-brand-950/95"
    >
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 text-xs font-medium sm:text-sm transition ${
              active
                ? "border-accent-600 text-accent-700 dark:border-accent-400 dark:text-accent-300"
                : "border-transparent text-brand-600 dark:text-brand-300"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="max-sm:sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

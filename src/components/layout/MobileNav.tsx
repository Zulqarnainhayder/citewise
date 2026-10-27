"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatIcon, FolderIcon } from "@/components/icons";

const tabs = [
  { href: "/", label: "Documents", Icon: FolderIcon },
  { href: "/chat", label: "Chat", Icon: ChatIcon },
];

/** Page switcher for small screens, where the sidebar is hidden. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="flex h-12 border-b border-brand-200 bg-white/90 backdrop-blur dark:border-brand-800 dark:bg-brand-950/90"
    >
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 text-sm font-medium transition ${
              active
                ? "border-accent-600 text-accent-700 dark:border-accent-400 dark:text-accent-300"
                : "border-transparent text-brand-600 dark:text-brand-300"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

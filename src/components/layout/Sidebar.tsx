import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { ChatIcon, FolderIcon, LayersIcon, SettingsIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AccountCard } from "./AccountCard";
import { NavItem } from "./NavItem";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-brand-200 bg-white lg:flex dark:border-brand-800 dark:bg-brand-950">
      <div className="flex h-16 shrink-0 items-center border-b border-brand-200 px-5 dark:border-brand-800">
        <Logo size={34} />
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400">
          Workspace
        </p>
        <NavItem label="Documents" icon={FolderIcon} href="/" active />
        <NavItem label="Chat" icon={ChatIcon} soon />
        <NavItem label="Workspaces" icon={LayersIcon} soon />
        <NavItem label="Settings" icon={SettingsIcon} soon />
      </nav>

      <div className="px-3 pb-3">
        <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400">
          Appearance
        </p>
        <ThemeToggle />
      </div>

      <Suspense fallback={<div className="h-32 border-t border-brand-200 dark:border-brand-800" />}>
        <AccountCard />
      </Suspense>
    </aside>
  );
}

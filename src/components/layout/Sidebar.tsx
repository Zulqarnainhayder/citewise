import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { ChatIcon, FolderIcon, LayersIcon, SettingsIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ChatHistoryPanel } from "@/features/chat/components/ChatHistoryPanel";
import { AccountCard } from "./AccountCard";
import { NavItem } from "./NavItem";

const iconClass = "h-[18px] w-[18px]";

const sectionLabel =
  "px-3 text-[11px] font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-brand-200 bg-white lg:flex dark:border-brand-800 dark:bg-brand-950">
      <div className="flex h-16 shrink-0 items-center border-b border-brand-200 px-5 dark:border-brand-800">
        <Logo size={34} />
      </div>

      {/* The nav reads the current path, which is runtime data on dynamic routes. */}
      <Suspense fallback={<div className="flex-1" />}>
        <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className={`${sectionLabel} pb-1 pt-2`}>Workspace</p>
          <NavItem label="Documents" icon={<FolderIcon className={iconClass} />} href="/" />
          <NavItem label="Chat" icon={<ChatIcon className={iconClass} />} href="/chat" />
          <NavItem label="Workspaces" icon={<LayersIcon className={iconClass} />} soon />
          <NavItem label="Settings" icon={<SettingsIcon className={iconClass} />} soon />

          <div className="pt-4">
            <p className={`${sectionLabel} pb-2`}>Recent chats</p>
            <ChatHistoryPanel />
          </div>
        </nav>
      </Suspense>

      <div className="px-3 pb-3">
        <p className={`${sectionLabel} px-1 pb-1.5`}>Appearance</p>
        <ThemeToggle />
      </div>

      <Suspense fallback={<div className="h-32 border-t border-brand-200 dark:border-brand-800" />}>
        <AccountCard />
      </Suspense>
    </aside>
  );
}

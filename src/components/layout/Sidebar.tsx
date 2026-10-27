import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { FolderIcon, LayersIcon, SettingsIcon } from "@/components/icons";
import { ChatHistoryPanel } from "@/features/chat/components/ChatHistoryPanel";
import { NewChatLink } from "@/features/chat/components/NewChatLink";
import { AccountCard } from "./AccountCard";
import { NavItem } from "./NavItem";

const iconClass = "h-[18px] w-[18px]";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-brand-200/80 bg-brand-100 lg:flex dark:border-brand-800 dark:bg-brand-900">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo size={32} />
      </div>

      {/* These read the current path, which is runtime data on dynamic routes. */}
      <Suspense fallback={<div className="flex-1" />}>
        <div className="flex min-h-0 flex-1 flex-col">
          <nav aria-label="Main" className="space-y-0.5 px-3">
            <NewChatLink />
            <NavItem label="Documents" icon={<FolderIcon className={iconClass} />} href="/" />
            <NavItem label="Workspaces" icon={<LayersIcon className={iconClass} />} soon />
            <NavItem label="Settings" icon={<SettingsIcon className={iconClass} />} soon />
          </nav>

          <section aria-label="Recent chats" className="mt-5 flex min-h-0 flex-1 flex-col px-3">
            <h2 className="px-3 pb-2 text-xs font-medium text-brand-500 dark:text-brand-400">Recents</h2>
            <div className="min-h-0 flex-1 overflow-y-auto pb-3">
              <ChatHistoryPanel />
            </div>
          </section>
        </div>
      </Suspense>

      <Suspense fallback={<div className="h-28 border-t border-brand-200/80 dark:border-brand-800" />}>
        <AccountCard />
      </Suspense>
    </aside>
  );
}

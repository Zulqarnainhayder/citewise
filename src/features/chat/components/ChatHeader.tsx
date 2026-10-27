import type { ReactNode } from "react";
import { HistoryIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

type Props = {
  scope: ReactNode;
  canReset: boolean;
  onNewChat: () => void;
  /** Opens the saved-chat list; only shown on small screens. */
  onOpenHistory: () => void;
};

export function ChatHeader({ scope, canReset, onNewChat, onOpenHistory }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-200 bg-white px-4 py-3 sm:px-6 dark:border-brand-800 dark:bg-brand-950">
      <div>
        <h1 className="text-lg font-semibold text-brand-900 dark:text-white">Chat</h1>
        <p className="text-xs text-brand-600 dark:text-brand-300">Answers with page citations</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {scope}
        <Button variant="secondary" size="sm" onClick={onOpenHistory} className="lg:hidden" aria-label="Chat history">
          <HistoryIcon className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={onNewChat} disabled={!canReset}>
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">New chat</span>
        </Button>
      </div>
    </div>
  );
}

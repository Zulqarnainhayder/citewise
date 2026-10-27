import { HistoryIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

type Props = {
  /** The saved chat's title; a new chat shows "New chat". */
  title?: string;
  canReset: boolean;
  onNewChat: () => void;
  /** Opens the saved-chat list; only shown on small screens. */
  onOpenHistory: () => void;
};

export function ChatHeader({ title, canReset, onNewChat, onOpenHistory }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-brand-200/70 bg-brand-50 px-4 sm:px-6 dark:border-brand-800 dark:bg-brand-950">
      <h1 className="min-w-0 truncate text-[15px] font-medium tracking-tight text-brand-900 dark:text-white">
        {title ?? "New chat"}
      </h1>
      {/* The sidebar has these on large screens. */}
      <div className="flex shrink-0 items-center gap-2 lg:hidden">
        <Button variant="secondary" size="sm" onClick={onOpenHistory} aria-label="Chat history">
          <HistoryIcon className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
        </Button>
        <Button variant="secondary" size="sm" onClick={onNewChat} disabled={!canReset}>
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">New chat</span>
        </Button>
      </div>
    </header>
  );
}

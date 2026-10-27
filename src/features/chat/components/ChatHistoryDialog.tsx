"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ChatHistoryPanel } from "./ChatHistoryPanel";

type Props = { open: boolean; onClose: () => void };

/** The saved-chat list in a dialog, for small screens without the sidebar. */
export function ChatHistoryDialog({ open, onClose }: Props) {
  const titleId = useId();

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="max-w-md">
      <div className="flex items-center justify-between border-b border-brand-200 px-5 py-4 dark:border-brand-700">
        <h2 id={titleId} className="text-lg font-semibold">
          Chat history
        </h2>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto p-3">
        {open && <ChatHistoryPanel onNavigate={onClose} />}
      </div>
    </Modal>
  );
}

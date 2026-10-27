"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PdfViewerPanel } from "@/features/viewer/components/PdfViewerPanel";
import { ViewerProvider } from "@/features/viewer/components/ViewerProvider";
import { useDocuments } from "@/features/documents/hooks/useDocuments";
import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import { useChat } from "../hooks/useChat";
import type { ChatMessage } from "../types";
import { ChatHeader } from "./ChatHeader";
import { ChatHistoryDialog } from "./ChatHistoryDialog";
import { Composer } from "./Composer";
import { EmptyState } from "./EmptyState";
import { MessageList } from "./MessageList";
import { ScopeChips } from "./ScopeChips";

type Props = {
  chatId?: string;
  initialTitle?: string;
  initialMessages?: ChatMessage[];
};

/** One conversation: the chat on the left and, when a citation is opened, the PDF on the right. */
export function ChatSession({ chatId, initialTitle, initialMessages }: Props) {
  const router = useRouter();
  const { documents, loading } = useDocuments();
  const { workspaces } = useWorkspaces();
  // /chat?workspace=<id> (from the Workspaces page) starts the chat inside one workspace.
  const [workspaceId, setWorkspaceId] = useState<string | null>(useSearchParams().get("workspace"));
  const { messages, streaming, title, send, stop, reset, retry } = useChat({
    chatId,
    initialTitle,
    initialMessages,
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  // null means "all ready documents", including ones added later.
  const [chosen, setChosen] = useState<string[] | null>(null);

  const ready = useMemo(() => documents.filter((d) => d.status === "ready"), [documents]);
  // Documents the chat may read: everything ready, or just the chosen workspace.
  const inScope = useMemo(
    () => (workspaceId ? ready.filter((d) => d.workspace_id === workspaceId) : ready),
    [ready, workspaceId],
  );
  const readyIds = useMemo(() => inScope.map((d) => d.id), [inScope]);
  const selected = chosen ? chosen.filter((id) => readyIds.includes(id)) : readyIds;
  const documentIds = chosen === null && !workspaceId ? undefined : selected;
  const noneSelected = ready.length > 0 && selected.length === 0;

  function changeWorkspace(id: string | null) {
    setWorkspaceId(id);
    setChosen(null);
  }

  function toggle(id: string) {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    setChosen(next.length === readyIds.length ? null : next);
  }

  const ask = (question: string) => void send(question, documentIds);

  function newChat() {
    reset();
    router.push("/chat");
  }

  return (
    <ViewerProvider>
      <div className="flex h-[calc(100dvh-6.5rem)] bg-brand-50 lg:h-dvh dark:bg-brand-950">
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatHeader
            title={title}
            canReset={messages.length > 0}
            onNewChat={newChat}
            onOpenHistory={() => setHistoryOpen(true)}
          />

          {messages.length === 0 ? (
            <EmptyState
              documentCount={selected.length}
              hasReadyDocuments={ready.length > 0}
              loading={loading}
              onPick={ask}
            />
          ) : (
            <MessageList messages={messages} onRetry={() => retry(documentIds)} />
          )}

          <div className="bg-brand-50 pt-2 dark:bg-brand-950">
            <Composer
              streaming={streaming}
              disabled={(!loading && ready.length === 0) || noneSelected}
              placeholder={
                noneSelected
                  ? "Select at least one document above to ask a question"
                  : ready.length === 0 && !loading
                    ? "Process a document to start asking questions"
                    : undefined
              }
              scope={
                ready.length > 0 && (
                  <ScopeChips
                    documents={inScope}
                    workspaces={workspaces}
                    workspaceId={workspaceId}
                    onWorkspaceChange={changeWorkspace}
                    selected={selected}
                    onToggle={toggle}
                    onSelectAll={() => setChosen(null)}
                  />
                )
              }
              onSend={ask}
              onStop={stop}
            />
          </div>
        </div>

        <PdfViewerPanel />
        <ChatHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />
      </div>
    </ViewerProvider>
  );
}

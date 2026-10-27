"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useDocuments } from "@/features/documents/hooks/useDocuments";
import { useChat } from "../hooks/useChat";
import type { ChatMessage } from "../types";
import { ChatHeader } from "./ChatHeader";
import { ChatHistoryDialog } from "./ChatHistoryDialog";
import { Composer } from "./Composer";
import { EmptyState } from "./EmptyState";
import { MessageList } from "./MessageList";
import { ALL_DOCUMENTS, ScopePicker } from "./ScopePicker";

type Props = {
  chatId?: string;
  initialMessages?: ChatMessage[];
};

/** One conversation: the header, messages and composer. */
export function ChatSession({ chatId, initialMessages }: Props) {
  const router = useRouter();
  const { documents, loading } = useDocuments();
  const { messages, streaming, send, stop, reset, retry } = useChat({ chatId, initialMessages });
  const [scope, setScope] = useState(ALL_DOCUMENTS);
  const [historyOpen, setHistoryOpen] = useState(false);

  const ready = useMemo(() => documents.filter((d) => d.status === "ready"), [documents]);
  // A deleted or not-yet-ready document falls back to searching everything.
  const activeScope = ready.some((d) => d.id === scope) ? scope : ALL_DOCUMENTS;
  const documentIds = activeScope === ALL_DOCUMENTS ? undefined : [activeScope];

  const ask = (question: string) => void send(question, documentIds);

  function newChat() {
    reset();
    router.push("/chat");
  }

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] flex-col lg:h-dvh">
      <ChatHeader
        canReset={messages.length > 0}
        onNewChat={newChat}
        onOpenHistory={() => setHistoryOpen(true)}
        scope={
          ready.length > 0 && (
            <ScopePicker documents={ready} value={activeScope} onChange={setScope} />
          )
        }
      />

      {messages.length === 0 ? (
        <EmptyState hasReadyDocuments={ready.length > 0} loading={loading} onPick={ask} />
      ) : (
        <MessageList messages={messages} onRetry={() => retry(documentIds)} />
      )}

      <Composer
        streaming={streaming}
        disabled={!loading && ready.length === 0}
        onSend={ask}
        onStop={stop}
      />

      <ChatHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}

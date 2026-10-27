"use client";

import { useCallback, useRef, useState } from "react";
import { notifyChatsChanged } from "../lib/chatsChanged";
import { readEvents } from "../lib/readEvents";
import type { ChatMessage } from "../types";

type Options = {
  /** The saved chat being continued; undefined for a new chat. */
  chatId?: string;
  initialMessages?: ChatMessage[];
};

/** Chat state: sends questions, streams answers in, supports stop and retry. */
export function useChat({ chatId: initialChatId, initialMessages = [] }: Options = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatId, setChatId] = useState(initialChatId);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (question: string, documentIds?: string[], base: ChatMessage[] = messages) => {
      const botId = crypto.randomUUID();
      setMessages([
        ...base,
        { id: crypto.randomUUID(), role: "user", content: question, sources: [], status: "done" },
        { id: botId, role: "assistant", content: "", sources: [], status: "streaming" },
      ]);
      setStreaming(true);

      const patch = (changes: Partial<ChatMessage>) =>
        setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, ...changes } : m)));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // The server keeps the conversation, so only the new question is sent.
          body: JSON.stringify({ question, chatId, documentIds }),
          signal: controller.signal,
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Something went wrong. Please try again.");
        }

        let text = "";
        for await (const event of readEvents(response)) {
          if (event.type === "chat") {
            setChatId(event.chatId);
            // Put the chat's address in the URL without leaving this page.
            window.history.replaceState(null, "", `/chat/${event.chatId}`);
            notifyChatsChanged();
          } else if (event.type === "sources") {
            patch({ sources: event.sources });
          } else if (event.type === "delta") {
            text += event.text;
            patch({ content: text });
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
        patch({ status: "done" });
      } catch (err) {
        if (controller.signal.aborted) {
          patch({ status: "done" }); // keep whatever was written before Stop
        } else {
          patch({
            status: "error",
            error:
              err instanceof TypeError
                ? "Check your connection and try again."
                : err instanceof Error
                  ? err.message
                  : "Something went wrong. Please try again.",
          });
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
        notifyChatsChanged(); // the chat moves to the top of the list
      }
    },
    [messages, chatId],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setChatId(undefined);
  }, []);

  /** Re-asks the last question after an error; the server won't save it twice. */
  const retry = useCallback(
    (documentIds?: string[]) => {
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (!lastUser) return;
      void send(lastUser.content, documentIds, messages.slice(0, -2));
    },
    [messages, send],
  );

  return { messages, streaming, send, stop, reset, retry };
}

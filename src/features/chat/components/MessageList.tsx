"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import { MessageBubble } from "./MessageBubble";

type Props = {
  messages: ChatMessage[];
  onRetry: () => void;
};

/** Scrolls to the newest text, unless the reader has scrolled up to re-read. */
export function MessageList({ messages, onRetry }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      onScroll={(e) => {
        const el = e.currentTarget;
        stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      }}
      className="flex-1 overflow-y-auto"
    >
      <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6 sm:px-6">
        {messages.map((message, i) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRetry={i === messages.length - 1 ? onRetry : undefined}
          />
        ))}
      </div>
    </div>
  );
}

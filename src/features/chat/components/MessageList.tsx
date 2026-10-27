"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon } from "@/components/icons";
import type { ChatMessage } from "../types";
import { MessageBubble } from "./MessageBubble";

type Props = {
  messages: ChatMessage[];
  onRetry: () => void;
};

const NEAR_BOTTOM_PX = 80;

/** Follows new text while you read at the bottom; offers a jump button if you scroll up. */
export function MessageList({ messages, onRetry }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const [showJump, setShowJump] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function jumpToLatest() {
    const el = containerRef.current;
    if (!el) return;
    stickToBottom.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setShowJump(false);
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={containerRef}
        role="log"
        aria-live="polite"
        onScroll={(e) => {
          const el = e.currentTarget;
          const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
          stickToBottom.current = nearBottom;
          setShowJump((current) => (current === !nearBottom ? current : !nearBottom));
        }}
        className="h-full overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-8 sm:px-6">
          {messages.map((message, i) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRetry={i === messages.length - 1 ? onRetry : undefined}
            />
          ))}
        </div>
      </div>

      {showJump && (
        <button
          type="button"
          onClick={jumpToLatest}
          aria-label="Jump to the latest message"
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3.5 py-2 text-xs font-medium text-brand-700 shadow-lg transition hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-100 dark:hover:bg-brand-800"
        >
          <ArrowDownIcon className="h-3.5 w-3.5" />
          Latest
        </button>
      )}
    </div>
  );
}

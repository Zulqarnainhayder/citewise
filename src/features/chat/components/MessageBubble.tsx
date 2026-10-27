"use client";

import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import type { ChatMessage } from "../types";
import { AnswerText } from "./AnswerText";
import { SourceChips } from "./SourceChips";

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="CiteWise is thinking">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

type Props = {
  message: ChatMessage;
  /** Shown on a failed answer; re-asks the question. */
  onRetry?: () => void;
};

export function MessageBubble({ message, onRetry }: Props) {
  // Which cited passage is showing under the answer.
  const [openN, setOpenN] = useState<number | null>(null);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-accent-700 px-4 py-2.5 text-sm leading-relaxed text-white sm:max-w-[75%]">
          {message.content}
        </p>
      </div>
    );
  }

  const waiting = message.status === "streaming" && !message.content;
  const done = message.status === "done";

  return (
    <div className="flex items-start gap-3">
      <LogoMark size={32} />
      <div className="min-w-0 max-w-[90%] flex-1 rounded-2xl rounded-tl-md border border-brand-200 bg-white px-4 py-3 text-sm leading-relaxed text-brand-800 shadow-sm sm:max-w-[80%] dark:border-brand-800 dark:bg-brand-900 dark:text-brand-100">
        {waiting ? (
          <TypingDots />
        ) : (
          <AnswerText
            text={message.content}
            sources={message.sources}
            onCite={done ? (n) => setOpenN((current) => (current === n ? null : n)) : undefined}
          />
        )}

        {message.status === "error" && (
          <div role="alert" className="mt-1 flex flex-wrap items-center gap-3 text-red-700 dark:text-red-300">
            <span>{message.error}</span>
            {onRetry && (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
        )}

        {done && (
          <SourceChips
            content={message.content}
            sources={message.sources}
            openN={openN}
            onOpenChange={setOpenN}
          />
        )}
      </div>
    </div>
  );
}

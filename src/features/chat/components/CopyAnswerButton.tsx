"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

/** Copies the answer text to the clipboard and confirms for a moment. */
export function CopyAnswerButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked; nothing else to do.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy answer"}
      title="Copy answer"
      className="inline-flex items-center gap-1.5 rounded-md p-1.5 text-xs font-medium text-brand-500 transition hover:bg-brand-200/60 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 dark:text-brand-400 dark:hover:bg-brand-800 dark:hover:text-white"
    >
      {copied ? <CheckIcon className="h-4 w-4 text-accent-600" /> : <CopyIcon className="h-4 w-4" />}
      {copied && <span className="pr-1">Copied</span>}
    </button>
  );
}

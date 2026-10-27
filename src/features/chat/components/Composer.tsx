"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { SendIcon, StopIcon } from "@/components/icons";

type Props = {
  streaming: boolean;
  disabled?: boolean;
  /** Overrides the default hint, e.g. to explain why sending is disabled. */
  placeholder?: string;
  /** Shown inside the card above the text, e.g. the document chips. */
  scope?: ReactNode;
  onSend: (question: string) => void;
  onStop: () => void;
};

const MAX_HEIGHT_PX = 176;
const MAX_CHARS = 2000;
const SHOW_COUNT_AFTER = 1600;

/** The message box: document scope, text and send in one slim card. */
export function Composer({ streaming, disabled, placeholder, scope, onSend, onStop }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }

  function submit() {
    const question = value.trim();
    if (!question || streaming || disabled) return;
    onSend(question);
    setValue("");
    requestAnimationFrame(resize);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        submit();
      }}
      className="bg-brand-50 px-4 pb-3 sm:px-6 dark:bg-brand-950"
    >
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-brand-200 bg-white shadow-sm transition focus-within:border-brand-300 focus-within:shadow-md dark:border-brand-700 dark:bg-brand-900 dark:focus-within:border-brand-600">
        {scope}

        <div className="flex items-end gap-2 px-3 pb-3 pt-1">
          <textarea
            ref={ref}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => {
              setValue(e.target.value);
              resize();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? "Ask about your documents…"}
            aria-label="Your question"
            maxLength={MAX_CHARS}
            className="block max-h-44 min-h-[2.5rem] w-full resize-none bg-transparent px-1.5 py-2 text-[15px] leading-6 text-brand-900 outline-none placeholder:text-brand-500 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-brand-400"
          />

          {value.length > SHOW_COUNT_AFTER && (
            <span className="pb-2.5 text-xs tabular-nums text-brand-500 dark:text-brand-400">
              {value.length}/{MAX_CHARS}
            </span>
          )}

          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              title="Stop"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/30 dark:bg-brand-200 dark:text-brand-900 dark:hover:bg-white"
            >
              <StopIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim() || disabled}
              aria-label="Send question"
              title="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-700 text-white transition hover:bg-accent-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/30 disabled:cursor-not-allowed disabled:bg-brand-200 disabled:text-brand-400 dark:disabled:bg-brand-800 dark:disabled:text-brand-500"
            >
              <SendIcon className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
      </div>

      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-brand-500 dark:text-brand-400">
        CiteWise is AI and can make mistakes. Check the cited pages for anything important.
      </p>
    </form>
  );
}

"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { SendIcon, StopIcon } from "@/components/icons";

type Props = {
  streaming: boolean;
  disabled?: boolean;
  onSend: (question: string) => void;
  onStop: () => void;
};

const MAX_HEIGHT_PX = 160;

export function Composer({ streaming, disabled, onSend, onStop }: Props) {
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
      className="border-t border-brand-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 dark:border-brand-800 dark:bg-brand-950/80"
    >
      <div className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-brand-200 bg-white p-2 shadow-sm focus-within:border-accent-600 focus-within:ring-4 focus-within:ring-accent-600/15 dark:border-brand-700 dark:bg-brand-900 dark:focus-within:border-accent-400 dark:focus-within:ring-accent-400/20">
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
          placeholder={disabled ? "Process a document to start asking questions" : "Ask a question about your documents…"}
          aria-label="Your question"
          maxLength={2000}
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-brand-900 outline-none placeholder:text-brand-500 disabled:cursor-not-allowed dark:text-white dark:placeholder:text-brand-400"
        />
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            title="Stop"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/30 dark:bg-brand-200 dark:text-brand-900 dark:hover:bg-white"
          >
            <StopIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            aria-label="Send question"
            title="Send"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-700 text-white transition hover:bg-accent-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-600/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendIcon className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-brand-500 dark:text-brand-400">
        Answers come only from your documents. Check the cited pages for anything important.
      </p>
    </form>
  );
}

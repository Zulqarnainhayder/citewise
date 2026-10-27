"use client";

import { useEffect, useRef } from "react";
import { FileTextIcon } from "@/components/icons";
import { useViewer } from "@/features/viewer/components/ViewerProvider";
import { citedNumbers } from "../lib/citations";
import type { Source } from "../types";

const pageKey = (s: Source) => `${s.documentId}:${s.page}`;

type Props = {
  content: string;
  sources: Source[];
  /** The source whose passage is showing, if any. */
  openN: number | null;
  onOpenChange: (n: number | null) => void;
};

/** Sources the answer actually cites, one chip per document page. */
export function SourceChips({ content, sources, openN, onOpenChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewer = useViewer();

  const cited = citedNumbers(content);
  const citedSources = sources.filter((s) => cited.has(s.n));
  const seen = new Set<string>();
  const chips = citedSources.filter((s) => !seen.has(pageKey(s)) && seen.add(pageKey(s)));
  const active = citedSources.find((s) => s.n === openN);

  // Bring the passage into view when a citation badge in the text opens it.
  useEffect(() => {
    if (openN !== null) rootRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [openN]);

  if (chips.length === 0) return null;

  return (
    <div ref={rootRef} className="mt-3 border-t border-brand-200 pt-3 dark:border-brand-700">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-500 dark:text-brand-400">
        Sources
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((s) => {
          const isOpen = active !== undefined && pageKey(active) === pageKey(s);
          return (
            <button
              key={s.n}
              type="button"
              onClick={() => onOpenChange(isOpen ? null : s.n)}
              aria-expanded={isOpen}
              className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 ${
                isOpen
                  ? "border-accent-600 bg-accent-100 text-accent-700 dark:border-accent-400 dark:bg-accent-700/25 dark:text-accent-200"
                  : "border-brand-200 bg-brand-50 text-brand-700 hover:border-accent-600 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-200"
              }`}
            >
              <FileTextIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{s.title}</span>
              <span className="shrink-0 text-brand-500 dark:text-brand-300">· p. {s.page}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-3 overflow-hidden rounded-lg border border-l-4 border-brand-200 border-l-accent-600 bg-white dark:border-brand-700 dark:border-l-accent-400 dark:bg-brand-900">
          <div className="flex items-center justify-between gap-3 border-b border-brand-200/70 px-4 py-2 font-sans dark:border-brand-700">
            <p className="min-w-0 truncate text-xs font-semibold text-brand-500 dark:text-brand-400">
              Source {active.n} · {active.title}, page {active.page}
            </p>
            <button
              type="button"
              onClick={() =>
                viewer.open({
                  documentId: active.documentId,
                  title: active.title,
                  page: active.page,
                  passage: active.snippet,
                })
              }
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-accent-700 transition hover:bg-accent-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 dark:text-accent-300 dark:hover:bg-accent-700/20"
            >
              <FileTextIcon className="h-3.5 w-3.5" />
              View in PDF
            </button>
          </div>
          <blockquote className="max-h-56 overflow-y-auto px-4 py-3 font-serif text-sm leading-[1.7] text-brand-700 dark:text-brand-200">
            {active.snippet}
          </blockquote>
        </div>
      )}
    </div>
  );
}

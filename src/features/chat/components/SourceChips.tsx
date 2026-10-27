"use client";

import { useEffect, useRef } from "react";
import { FileTextIcon } from "@/components/icons";
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
        <blockquote className="mt-3 rounded-lg border-l-4 border-accent-600 bg-brand-50 px-3.5 py-2.5 text-sm leading-relaxed text-brand-700 dark:bg-brand-950/60 dark:text-brand-200">
          <p className="mb-1 text-xs font-semibold text-brand-500 dark:text-brand-400">
            Source {active.n} · {active.title}, page {active.page}
          </p>
          {active.snippet}
        </blockquote>
      )}
    </div>
  );
}

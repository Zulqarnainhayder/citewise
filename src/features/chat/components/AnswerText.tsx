"use client";

import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import { linkCitations } from "../lib/citations";
import type { Source } from "../types";
import { CitationBadge } from "./CitationBadge";

const CITE_PREFIX = "cite:";

/** Renders the model's markdown and turns [n] markers into citation badges. */
type Props = {
  text: string;
  sources: Source[];
  /** When set, citation badges become buttons that call this with the source number. */
  onCite?: (n: number) => void;
};

export function AnswerText({ text, sources, onCite }: Props) {
  const byNumber = new Map(sources.map((s) => [s.n, s]));

  const components: Components = {
    a: ({ href, children }) => {
      if (href?.startsWith(CITE_PREFIX)) {
        const n = Number(href.slice(CITE_PREFIX.length));
        return <CitationBadge n={n} source={byNumber.get(n)} onOpen={onCite} />;
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-700 underline dark:text-accent-400">
          {children}
        </a>
      );
    },
    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
    ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    code: ({ children }) => (
      <code className="rounded bg-brand-100 px-1 py-0.5 font-mono text-[0.85em] dark:bg-brand-800">{children}</code>
    ),
  };

  return (
    <ReactMarkdown
      components={components}
      urlTransform={(url) => (url.startsWith(CITE_PREFIX) ? url : defaultUrlTransform(url))}
    >
      {linkCitations(text, CITE_PREFIX)}
    </ReactMarkdown>
  );
}

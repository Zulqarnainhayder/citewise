"use client";

import ReactMarkdown, { defaultUrlTransform, type Components } from "react-markdown";
import { linkCitations } from "../lib/citations";
import type { Source } from "../types";
import { CitationBadge } from "./CitationBadge";

const CITE_PREFIX = "cite:";

type Props = {
  text: string;
  sources: Source[];
  /** When set, citation badges become buttons that call this with the source number. */
  onCite?: (n: number) => void;
};

const list =
  "mb-4 space-y-2 pl-6 marker:text-brand-400 last:mb-0 [&_ul]:mb-0 [&_ul]:mt-2 [&_ol]:mb-0 [&_ol]:mt-2";

const heading = "font-sans font-semibold tracking-tight text-brand-900 first:mt-0 dark:text-white";

/**
 * Renders the model's markdown as comfortable long-form reading: a serif body at
 * 16px with comfortable line height, sans headings, and [n] markers as citation badges.
 */
export function AnswerText({ text, sources, onCite }: Props) {
  const byNumber = new Map(sources.map((s) => [s.n, s]));

  const components: Components = {
    a: ({ href, children }) => {
      if (href?.startsWith(CITE_PREFIX)) {
        const n = Number(href.slice(CITE_PREFIX.length));
        return <CitationBadge n={n} source={byNumber.get(n)} onOpen={onCite} />;
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent-700 underline decoration-accent-700/40 underline-offset-[3px] hover:decoration-accent-700 dark:text-accent-400"
        >
          {children}
        </a>
      );
    },
    h1: ({ children }) => <h3 className={`${heading} mb-2.5 mt-6 text-lg`}>{children}</h3>,
    h2: ({ children }) => <h3 className={`${heading} mb-2.5 mt-6 text-[17px]`}>{children}</h3>,
    h3: ({ children }) => <h4 className={`${heading} mb-2 mt-5 text-[15px]`}>{children}</h4>,
    p: ({ children }) => <p className="mb-4 text-pretty last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className={`${list} list-disc`}>{children}</ul>,
    ol: ({ children }) => <ol className={`${list} list-decimal`}>{children}</ol>,
    li: ({ children }) => <li className="pl-1 text-pretty">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold text-brand-900 dark:text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    blockquote: ({ children }) => (
      <blockquote className="mb-4 border-l-[3px] border-accent-600/40 pl-5 italic text-brand-600 last:mb-0 dark:text-brand-300">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-6 border-brand-200 dark:border-brand-700" />,
    code: ({ children }) => (
      <code className="rounded-md bg-brand-100 px-1.5 py-0.5 font-mono text-[0.8em] dark:bg-brand-800">
        {children}
      </code>
    ),
  };

  return (
    <div className="font-serif text-base leading-[1.7] tracking-[-0.002em] text-brand-800 dark:text-brand-100">
      <ReactMarkdown
        components={components}
        urlTransform={(url) => (url.startsWith(CITE_PREFIX) ? url : defaultUrlTransform(url))}
      >
        {linkCitations(text, CITE_PREFIX)}
      </ReactMarkdown>
    </div>
  );
}

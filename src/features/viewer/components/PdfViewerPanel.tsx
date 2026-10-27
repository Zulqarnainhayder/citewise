"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ExternalLinkIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/Spinner";
import { useSupabase } from "@/lib/supabase/useSupabase";
import { usePdfDocument } from "../hooks/usePdfDocument";
import type { ViewerTarget } from "../types";
import { PdfPage } from "./PdfPage";
import { useViewer } from "./ViewerProvider";

const MIN_WIDTH = 280;
const MAX_WIDTH = 900;
const PADDING = 32;

const iconButton =
  "flex h-8 w-8 items-center justify-center rounded-lg text-brand-600 transition hover:bg-brand-200/60 hover:text-brand-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 disabled:cursor-not-allowed disabled:opacity-40 dark:text-brand-300 dark:hover:bg-brand-800 dark:hover:text-white";

/** Side panel showing the cited PDF page with the passage highlighted. */
export function PdfViewerPanel() {
  const { target, close } = useViewer();
  if (!target) return null;
  // Keyed so each opened page starts fresh (page number, scroll, size).
  return <Panel key={`${target.documentId}:${target.page}:${target.passage.slice(0, 20)}`} target={target} onClose={close} />;
}

function Panel({ target, onClose }: { target: ViewerTarget; onClose: () => void }) {
  const supabase = useSupabase();
  const { pdf, storagePath, loading, error } = usePdfDocument(target.documentId);
  const [page, setPage] = useState(target.page);
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, el.clientWidth - PADDING)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const scrollToHighlight = useCallback((top: number) => {
    scrollRef.current?.scrollTo({ top: Math.max(0, top - 96), behavior: "smooth" });
  }, []);

  async function openInNewTab() {
    if (!storagePath) return;
    const tab = window.open("about:blank", "_blank");
    const { data } = await supabase.storage.from("documents").createSignedUrl(storagePath, 120);
    if (data?.signedUrl && tab) tab.location.href = `${data.signedUrl}#page=${page}`;
    else tab?.close();
  }

  const pageCount = pdf?.numPages ?? 0;

  return (
    <aside
      aria-label={`PDF viewer: ${target.title}`}
      className="fixed inset-0 z-40 flex flex-col bg-brand-50 lg:static lg:z-auto lg:w-[30rem] lg:shrink-0 lg:border-l lg:border-brand-200/80 xl:w-[36rem] dark:bg-brand-950 dark:lg:border-brand-800"
    >
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-brand-200/70 px-3 dark:border-brand-800">
        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate text-sm font-medium text-brand-900 dark:text-white">{target.title}</p>
          <p className="text-xs text-brand-500 dark:text-brand-400">
            {pageCount > 0 ? `Page ${page} of ${pageCount}` : `Page ${page}`}
          </p>
        </div>
        <button type="button" className={iconButton} onClick={() => setPage((p) => p - 1)} disabled={page <= 1} aria-label="Previous page" title="Previous page">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <button type="button" className={iconButton} onClick={() => setPage((p) => p + 1)} disabled={!pageCount || page >= pageCount} aria-label="Next page" title="Next page">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
        <button type="button" className={iconButton} onClick={openInNewTab} disabled={!storagePath} aria-label="Open the PDF in a new tab" title="Open in a new tab">
          <ExternalLinkIcon className="h-4 w-4" />
        </button>
        <button type="button" className={iconButton} onClick={onClose} aria-label="Close PDF viewer" title="Close">
          <CloseIcon className="h-4 w-4" />
        </button>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto bg-brand-100 p-4 dark:bg-brand-900">
        {loading && (
          <p className="flex items-center justify-center gap-2 py-16 text-sm text-brand-600 dark:text-brand-300">
            <Spinner /> Opening PDF…
          </p>
        )}
        {error && (
          <p role="alert" className="py-16 text-center text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        {pdf && width > 0 && (
          <PdfPage
            pdf={pdf}
            pageNumber={page}
            width={width}
            passage={page === target.page ? target.passage : ""}
            onHighlight={scrollToHighlight}
          />
        )}
      </div>
    </aside>
  );
}

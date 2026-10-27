"use client";

import { useEffect, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import { useSupabase } from "@/lib/supabase/useSupabase";
import { loadPdfjs } from "../lib/pdfjs";

type State = {
  pdf: PDFDocumentProxy | null;
  storagePath: string | null;
  loading: boolean;
  error: string | null;
};

/** Downloads a document from private storage and opens it with PDF.js. */
export function usePdfDocument(documentId: string | null): State {
  const supabase = useSupabase();
  const [state, setState] = useState<State>({ pdf: null, storagePath: null, loading: false, error: null });

  useEffect(() => {
    if (!documentId) return;
    let cancelled = false;
    let task: PDFDocumentLoadingTask | null = null;

    (async () => {
      setState({ pdf: null, storagePath: null, loading: true, error: null });
      try {
        const { data: doc } = await supabase
          .from("documents")
          .select("storage_path")
          .eq("id", documentId)
          .maybeSingle();
        if (!doc) throw new Error("This document could not be found.");

        const { data: file, error } = await supabase.storage.from("documents").download(doc.storage_path);
        if (error || !file) throw new Error("The PDF file could not be downloaded.");

        const pdfjs = await loadPdfjs();
        task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
        const opened = await task.promise;
        if (cancelled) return;

        setState({ pdf: opened, storagePath: doc.storage_path as string, loading: false, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({
            pdf: null,
            storagePath: null,
            loading: false,
            error: err instanceof Error ? err.message : "The PDF could not be opened.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [documentId, supabase]);

  return state;
}

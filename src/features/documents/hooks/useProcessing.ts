"use client";

import { useCallback, useState } from "react";
import type { DocumentRow } from "../types";

type Update = (id: string, patch: Partial<DocumentRow>) => void;

/** Asks the server to read a document and keeps its status in sync. */
export function useProcessing(update: Update) {
  const [error, setError] = useState<string | null>(null);

  const process = useCallback(
    async (doc: Pick<DocumentRow, "id" | "title">) => {
      setError(null);
      update(doc.id, { status: "processing" });

      try {
        const response = await fetch(`/api/documents/${doc.id}/process`, {
          method: "POST",
        });
        const body = await response.json().catch(() => null);
        if (!response.ok || !body) {
          throw new Error(body?.error ?? "Processing failed. Please try again.");
        }
        update(doc.id, { status: "ready", page_count: body.pageCount });
      } catch (err) {
        update(doc.id, { status: "failed" });
        const reason =
          err instanceof TypeError
            ? "Check your connection and try again."
            : err instanceof Error
              ? err.message
              : "Please try again.";
        setError(`"${doc.title}" could not be processed. ${reason}`);
      }
    },
    [update],
  );

  return { process, error };
}

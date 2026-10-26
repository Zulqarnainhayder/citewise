"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/useSupabase";
import { DOCUMENTS_BUCKET, DOCUMENT_COLUMNS } from "../constants";
import type { DocumentRow } from "../types";

/** Loads the signed-in user's documents (RLS limits rows to their own). */
export function useDocuments() {
  const supabase = useSupabase();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("documents")
        .select(DOCUMENT_COLUMNS)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) setError(error.message);
      else setDocuments(data as DocumentRow[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const add = useCallback((doc: DocumentRow) => {
    setDocuments((prev) => [doc, ...prev]);
  }, []);

  /** Resolves to an error message, or null on success. */
  const remove = useCallback(
    async (doc: DocumentRow): Promise<string | null> => {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);
      if (error) return error.message;
      await supabase.storage.from(DOCUMENTS_BUCKET).remove([doc.storage_path]);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      return null;
    },
    [supabase],
  );

  return { documents, loading, error, add, remove };
}

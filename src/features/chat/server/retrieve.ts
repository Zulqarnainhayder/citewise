import type { SupabaseClient } from "@supabase/supabase-js";
import { embedTexts } from "@/features/processing/embed";
import type { Source } from "../types";

/** How many passages to give the model. */
export const TOP_K = 6;
/** Passages less similar than this are treated as unrelated. */
export const MIN_SIMILARITY = 0.45;

type MatchRow = {
  document_id: string;
  page_number: number;
  content: string;
  similarity: number;
};

/**
 * Finds the passages most similar to the question, among the signed-in user's
 * documents (row level security applies), and labels them [1], [2], ...
 */
export async function retrieveSources(
  supabase: SupabaseClient,
  question: string,
  documentIds?: string[],
): Promise<Source[]> {
  const [queryEmbedding] = await embedTexts([question], "RETRIEVAL_QUERY");

  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_count: TOP_K,
    filter_document_ids: documentIds?.length ? documentIds : null,
  });
  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as MatchRow[]).filter((r) => r.similarity >= MIN_SIMILARITY);
  if (rows.length === 0) return [];

  const { data: documents } = await supabase
    .from("documents")
    .select("id, title")
    .in("id", [...new Set(rows.map((r) => r.document_id))]);
  const titles = new Map((documents ?? []).map((d) => [d.id as string, d.title as string]));

  return rows.map((row, i) => ({
    n: i + 1,
    documentId: row.document_id,
    title: titles.get(row.document_id) ?? "Document",
    page: row.page_number,
    snippet: row.content,
  }));
}

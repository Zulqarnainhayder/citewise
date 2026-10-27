import type { SupabaseClient } from "@supabase/supabase-js";
import { embedTexts } from "@/features/processing/embed";
import type { Source } from "../types";

/** How many passages to give the model when searching one pool of text. */
export const TOP_K = 6;
/** Passages less similar than this are treated as unrelated. */
export const MIN_SIMILARITY = 0.45;
/** With a few documents, search each one so none is crowded out by another. */
const MAX_DOCUMENTS_SEARCHED_SEPARATELY = 5;
const PER_DOCUMENT_K = 3;
const MAX_SOURCES = 10;

type MatchRow = {
  document_id: string;
  page_number: number;
  content: string;
  similarity: number;
};

async function search(
  supabase: SupabaseClient,
  queryEmbedding: number[],
  count: number,
  documentIds: string[] | null,
): Promise<MatchRow[]> {
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_count: count,
    filter_document_ids: documentIds,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as MatchRow[];
}

async function readyDocumentIds(supabase: SupabaseClient) {
  const { data } = await supabase.from("documents").select("id").eq("status", "ready");
  return (data ?? []).map((d) => d.id as string);
}

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

  const selected = documentIds?.length ? documentIds : null;
  const scope = selected ?? (await readyDocumentIds(supabase));

  let rows: MatchRow[];
  if (scope.length > 1 && scope.length <= MAX_DOCUMENTS_SEARCHED_SEPARATELY) {
    const perDocument = await Promise.all(
      scope.map((id) => search(supabase, queryEmbedding, PER_DOCUMENT_K, [id])),
    );
    rows = perDocument
      .flat()
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_SOURCES);
  } else {
    rows = await search(supabase, queryEmbedding, TOP_K, selected);
  }

  rows = rows.filter((r) => r.similarity >= MIN_SIMILARITY);
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

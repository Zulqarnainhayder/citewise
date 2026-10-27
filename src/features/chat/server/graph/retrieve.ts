import type { RunnableConfig } from "@langchain/core/runnables";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createEmbeddings } from "@/lib/langchain/models";
import { SupabaseChunkStore } from "@/lib/langchain/supabaseChunkStore";
import type { Source } from "../../types";
import type { ChatGraphState } from "./state";

/** How many passages to give the model when searching one pool of text. */
export const TOP_K = 6;
/** Passages less similar than this are treated as unrelated. */
export const MIN_SIMILARITY = 0.45;
/** With a few documents, search each one so none is crowded out by another. */
const MAX_DOCUMENTS_SEARCHED_SEPARATELY = 5;
const PER_DOCUMENT_K = 3;
const MAX_SOURCES = 10;

async function readyDocumentIds(supabase: SupabaseClient) {
  const { data } = await supabase.from("documents").select("id").eq("status", "ready");
  return (data ?? []).map((d) => d.id as string);
}

/**
 * Graph node: finds the passages most similar to the question among the signed-in
 * user's documents (row level security applies) and labels them [1], [2], ...
 */
export async function retrieveNode(
  state: ChatGraphState,
  config: RunnableConfig,
): Promise<Partial<ChatGraphState>> {
  const supabase = config.configurable?.supabase as SupabaseClient;
  const embeddings = createEmbeddings("query");
  const store = new SupabaseChunkStore(embeddings, supabase);
  const queryVector = await embeddings.embedQuery(state.question);

  const selected = state.documentIds?.length ? state.documentIds : undefined;
  const scope = selected ?? (await readyDocumentIds(supabase));

  let hits;
  if (scope.length > 1 && scope.length <= MAX_DOCUMENTS_SEARCHED_SEPARATELY) {
    const perDocument = await Promise.all(
      scope.map((id) => store.similaritySearchVectorWithScore(queryVector, PER_DOCUMENT_K, { documentIds: [id] })),
    );
    hits = perDocument
      .flat()
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_SOURCES);
  } else {
    hits = await store.similaritySearchVectorWithScore(queryVector, TOP_K, { documentIds: selected });
  }

  hits = hits.filter(([, score]) => score >= MIN_SIMILARITY);
  if (hits.length === 0) return { sources: [] };

  const { data: documents } = await supabase
    .from("documents")
    .select("id, title")
    .in("id", [...new Set(hits.map(([doc]) => doc.metadata.documentId as string))]);
  const titles = new Map((documents ?? []).map((d) => [d.id as string, d.title as string]));

  const sources: Source[] = hits.map(([doc], i) => ({
    n: i + 1,
    documentId: doc.metadata.documentId,
    title: titles.get(doc.metadata.documentId) ?? "Document",
    page: doc.metadata.page,
    snippet: doc.pageContent,
  }));
  return { sources };
}

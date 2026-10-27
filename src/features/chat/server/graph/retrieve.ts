import type { RunnableConfig } from "@langchain/core/runnables";
import type { Document } from "@langchain/core/documents";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractKeywordTerms } from "@/lib/langchain/keywordTerms";
import { createEmbeddings } from "@/lib/langchain/models";
import { SupabaseChunkStore } from "@/lib/langchain/supabaseChunkStore";
import type { Source } from "../../types";
import { reciprocalRankFusion } from "./fusion";
import { rerank } from "./rerank";
import type { ChatGraphState } from "./state";

/** How many passages to give the model when searching one pool of text. */
export const TOP_K = 6;
/** Passages less similar than this are treated as unrelated. */
export const MIN_SIMILARITY = 0.45;
/** With a few documents, search each one so none is crowded out by another. */
const MAX_DOCUMENTS_SEARCHED_SEPARATELY = 5;
const PER_DOCUMENT_K = 3;
const MAX_SOURCES = 10;
/** How many fused candidates the reranker reads. */
const RERANK_CANDIDATES = 10;

/** "vector" searches by meaning only; the default "hybrid" adds keyword search and reranking. */
const hybridEnabled = () => process.env.RETRIEVAL_MODE !== "vector";
const rerankEnabled = () => process.env.RERANK !== "off";

async function readyDocumentIds(supabase: SupabaseClient) {
  const { data } = await supabase.from("documents").select("id").eq("status", "ready");
  return (data ?? []).map((d) => d.id as string);
}

/**
 * Adds keyword matches to the passages found by meaning and merges the two rankings. When keyword
 * search surfaced passages that meaning search missed, the model re-orders the candidates and drops
 * keyword matches that do not help. Each step falls back to the one before it, so a missing
 * database function or a busy model never breaks a question.
 */
async function hybridPassages(
  store: SupabaseChunkStore,
  question: string,
  byMeaning: Document[],
  documentIds: string[] | undefined,
  limit: number,
): Promise<Document[]> {
  const terms = extractKeywordTerms(question);
  let byKeyword: Document[] = [];
  if (terms.length > 0) {
    try {
      byKeyword = await store.keywordSearch(terms, limit, { documentIds });
    } catch (err) {
      console.error("Keyword search unavailable, using meaning search only:", err);
    }
  }

  const candidates = reciprocalRankFusion([byMeaning, byKeyword], (doc) => doc.metadata.chunkId as string).slice(
    0,
    RERANK_CANDIDATES,
  );
  if (candidates.length === 0) return [];

  const foundByMeaning = new Set(byMeaning.map((doc) => doc.metadata.chunkId as string));
  const keywordAddedSomething = byKeyword.some((doc) => !foundByMeaning.has(doc.metadata.chunkId as string));

  // When keyword search found nothing new, both searches agree and the fused order is good enough.
  // Reranking costs one more model call, so it is saved for the cases where the searches disagree.
  if (!keywordAddedSomething || !rerankEnabled()) return candidates.slice(0, limit);

  const ranked = await rerank(question, candidates, (doc) => foundByMeaning.has(doc.metadata.chunkId as string));
  return (ranked ?? candidates).slice(0, limit);
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

  const separate = scope.length > 1 && scope.length <= MAX_DOCUMENTS_SEARCHED_SEPARATELY;
  const limit = separate ? MAX_SOURCES : TOP_K;

  let hits;
  if (separate && scope.length <= MAX_DOCUMENTS_SEARCHED_SEPARATELY) {
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

  let passages: Document[] = hits.filter(([, score]) => score >= MIN_SIMILARITY).map(([doc]) => doc);

  if (hybridEnabled()) {
    passages = await hybridPassages(store, state.question, passages, selected, limit);
  }
  if (passages.length === 0) return { sources: [] };

  const { data: documents } = await supabase
    .from("documents")
    .select("id, title")
    .in("id", [...new Set(passages.map((doc) => doc.metadata.documentId as string))]);
  const titles = new Map((documents ?? []).map((d) => [d.id as string, d.title as string]));

  const sources: Source[] = passages.map((doc, i) => ({
    n: i + 1,
    documentId: doc.metadata.documentId,
    title: titles.get(doc.metadata.documentId) ?? "Document",
    page: doc.metadata.page,
    snippet: doc.pageContent,
  }));
  return { sources };
}

import { Document } from "@langchain/core/documents";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { VectorStore } from "@langchain/core/vectorstores";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ChunkFilter = { documentIds?: string[] };
export type AddChunkOptions = { documentId: string; userId: string };

type MatchRow = {
  id: string;
  document_id: string;
  page_number: number;
  content: string;
  similarity: number;
};

type KeywordRow = Omit<MatchRow, "similarity"> & { rank: number };

const INSERT_BATCH_SIZE = 100;

/**
 * A LangChain vector store over the `chunks` table and the `match_chunks`
 * Postgres function. It uses the caller's Supabase client, so row level
 * security applies to every read and write.
 */
export class SupabaseChunkStore extends VectorStore {
  declare FilterType: ChunkFilter;

  constructor(
    embeddings: EmbeddingsInterface,
    private readonly client: SupabaseClient,
  ) {
    super(embeddings, {});
  }

  _vectorstoreType() {
    return "supabase-chunks";
  }

  /** Stores chunks that already have vectors. Each document needs `page` and `chunkIndex` metadata. */
  async addVectors(vectors: number[][], documents: Document[], options?: AddChunkOptions) {
    if (!options) throw new Error("addVectors needs { documentId, userId }.");

    const rows = documents.map((doc, i) => ({
      document_id: options.documentId,
      user_id: options.userId,
      page_number: doc.metadata.page,
      chunk_index: doc.metadata.chunkIndex,
      content: doc.pageContent,
      embedding: vectors[i],
    }));

    for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
      const { error } = await this.client.from("chunks").insert(rows.slice(i, i + INSERT_BATCH_SIZE));
      if (error) throw new Error(error.message);
    }
  }

  async addDocuments(documents: Document[], options?: AddChunkOptions) {
    const vectors = await this.embeddings.embedDocuments(documents.map((d) => d.pageContent));
    await this.addVectors(vectors, documents, options);
  }

  /** The `k` chunks closest to a query vector, optionally limited to some documents. */
  async similaritySearchVectorWithScore(
    query: number[],
    k: number,
    filter?: ChunkFilter,
  ): Promise<[Document, number][]> {
    const { data, error } = await this.client.rpc("match_chunks", {
      query_embedding: query,
      match_count: k,
      filter_document_ids: filter?.documentIds?.length ? filter.documentIds : null,
    });
    if (error) throw new Error(error.message);

    return ((data ?? []) as MatchRow[]).map((row): [Document, number] => [
      new Document({
        pageContent: row.content,
        metadata: { chunkId: row.id, documentId: row.document_id, page: row.page_number },
      }),
      row.similarity,
    ]);
  }

  /**
   * The `k` chunks that best match some keywords (full-text search, any keyword may match),
   * best first. Needs the `keyword_match_chunks` function from migration 0002.
   */
  async keywordSearch(terms: string[], k: number, filter?: ChunkFilter): Promise<Document[]> {
    const { data, error } = await this.client.rpc("keyword_match_chunks", {
      query_terms: terms,
      match_count: k,
      filter_document_ids: filter?.documentIds?.length ? filter.documentIds : null,
    });
    if (error) throw new Error(error.message);

    return ((data ?? []) as KeywordRow[]).map(
      (row) =>
        new Document({
          pageContent: row.content,
          metadata: { chunkId: row.id, documentId: row.document_id, page: row.page_number },
        }),
    );
  }
}

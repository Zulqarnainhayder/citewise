import type { SupabaseClient } from "@supabase/supabase-js";
import { createEmbeddings } from "@/lib/langchain/models";
import { SupabaseChunkStore } from "@/lib/langchain/supabaseChunkStore";
import { ProcessingError, toProcessingError } from "./errors";
import { extractPages } from "./extractPages";
import { splitPages } from "./splitPages";

const BUCKET = "documents";
/** Keeps one request inside the serverless time limit and the free AI quota. */
const MAX_CHUNKS = 800;

export type ProcessResult = { pageCount: number; chunkCount: number };

/**
 * The ingestion pipeline: PDF -> pages -> LangChain text splitter -> Gemini
 * embeddings -> vector store (Postgres + pgvector). Moves the document through
 * processing to ready (or failed). Uses the caller's Supabase client, so row
 * level security applies.
 */
export async function processDocument(
  supabase: SupabaseClient,
  documentId: string,
  userId: string,
): Promise<ProcessResult> {
  const { data: doc } = await supabase
    .from("documents")
    .select("id, storage_path")
    .eq("id", documentId)
    .maybeSingle();
  if (!doc) throw new ProcessingError("Document not found.", 404);

  const setStatus = (patch: Record<string, unknown>) =>
    supabase.from("documents").update(patch).eq("id", documentId);

  await setStatus({ status: "processing" });

  try {
    const { data: file, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(doc.storage_path);
    if (downloadError || !file) {
      throw new ProcessingError("The uploaded file could not be found.", 404);
    }

    const pages = await extractPages(await file.arrayBuffer());
    const chunks = await splitPages(pages);

    if (chunks.length === 0) {
      throw new ProcessingError(
        "No readable text was found. Scanned or image-only PDFs are not supported yet.",
        422,
      );
    }
    if (chunks.length > MAX_CHUNKS) {
      throw new ProcessingError(
        "This document is too large to process. Try a shorter PDF.",
        413,
      );
    }

    const embeddings = createEmbeddings("document");
    let vectors: number[][];
    try {
      vectors = await embeddings.embedDocuments(chunks.map((chunk) => chunk.pageContent));
    } catch (err) {
      throw toProcessingError(err);
    }

    // Re-processing replaces old chunks instead of duplicating them. This happens
    // only after embedding succeeded, so a failed retry keeps the previous chunks.
    await supabase.from("chunks").delete().eq("document_id", documentId);

    const store = new SupabaseChunkStore(embeddings, supabase);
    try {
      await store.addVectors(vectors, chunks, { documentId, userId });
    } catch {
      await supabase.from("chunks").delete().eq("document_id", documentId);
      throw new ProcessingError("Could not save the processed document.", 500);
    }

    await setStatus({ status: "ready", page_count: pages.length });
    return { pageCount: pages.length, chunkCount: chunks.length };
  } catch (err) {
    await setStatus({ status: "failed" });
    throw err;
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { chunkText } from "./chunkText";
import { embedTexts } from "./embed";
import { ProcessingError } from "./errors";
import { extractPages } from "./extractPages";

const BUCKET = "documents";
const INSERT_BATCH_SIZE = 100;
/** Keeps one request inside the serverless time limit and the free AI quota. */
const MAX_CHUNKS = 800;

export type ProcessResult = { pageCount: number; chunkCount: number };

type ChunkInput = { page_number: number; chunk_index: number; content: string };

function buildChunks(pages: string[]): ChunkInput[] {
  const chunks: ChunkInput[] = [];
  pages.forEach((pageText, i) => {
    for (const content of chunkText(pageText)) {
      chunks.push({ page_number: i + 1, chunk_index: chunks.length, content });
    }
  });
  return chunks;
}

/**
 * Reads a stored PDF, splits it into page-aware chunks, embeds them and saves
 * them. Moves the document through processing to ready (or failed). Uses the
 * caller's Supabase client, so row level security applies.
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
    const chunks = buildChunks(pages);

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

    const vectors = await embedTexts(chunks.map((c) => c.content));

    // Re-processing replaces old chunks instead of duplicating them.
    await supabase.from("chunks").delete().eq("document_id", documentId);

    for (let i = 0; i < chunks.length; i += INSERT_BATCH_SIZE) {
      const rows = chunks.slice(i, i + INSERT_BATCH_SIZE).map((chunk, j) => ({
        ...chunk,
        document_id: documentId,
        user_id: userId,
        embedding: vectors[i + j],
      }));
      const { error } = await supabase.from("chunks").insert(rows);
      if (error) {
        await supabase.from("chunks").delete().eq("document_id", documentId);
        throw new ProcessingError("Could not save the processed document.", 500);
      }
    }

    await setStatus({ status: "ready", page_count: pages.length });
    return { pageCount: pages.length, chunkCount: chunks.length };
  } catch (err) {
    await setStatus({ status: "failed" });
    throw err;
  }
}

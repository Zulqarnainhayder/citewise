import type { SupabaseClient } from "@supabase/supabase-js";
import { createEmbeddings } from "@/lib/langchain/models";
import { SupabaseChunkStore } from "@/lib/langchain/supabaseChunkStore";
import { ProcessingError, toProcessingError } from "./errors";
import { extractPages } from "./extractPages";
import { OCR_MAX_PAGES, findBlankPages, ocrPages, shouldOcr } from "./ocr";
import { splitPages } from "./splitPages";

const BUCKET = "documents";
/** Keeps one request inside the serverless time limit and the free AI quota. */
const MAX_CHUNKS = 800;

export type ProcessResult = { pageCount: number; chunkCount: number };

/**
 * Fills in pages that have no text layer (scans) by reading them with OCR. Mutates `pages`.
 * A failure only matters when nothing else in the document is readable.
 */
async function readScannedPages(data: ArrayBuffer, pages: string[]): Promise<void> {
  const blank = findBlankPages(pages);
  const mostlyScanned = blank.length > pages.length / 2;

  if (!shouldOcr(blank.length)) {
    if (blank.length > OCR_MAX_PAGES && mostlyScanned) {
      throw new ProcessingError(
        `This PDF is mostly scanned pages (${blank.length}). Scanned PDFs can be up to ${OCR_MAX_PAGES} pages.`,
        413,
      );
    }
    return;
  }

  try {
    const text = await ocrPages(data, blank);
    for (const [page, content] of text) pages[page - 1] = content;
  } catch (err) {
    console.error("OCR failed:", err);
    if (blank.length < pages.length) return; // the pages that have text are still usable
    const known = toProcessingError(err);
    throw known instanceof ProcessingError
      ? known
      : new ProcessingError("The scanned pages could not be read. Please try again.", 502);
  }
}

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

    const data = await file.arrayBuffer();
    // PDF.js takes over the buffer it is given, so extraction gets a copy and OCR keeps the original.
    const pages = await extractPages(data.slice(0));
    await readScannedPages(data, pages);
    const chunks = await splitPages(pages);

    if (chunks.length === 0) {
      throw new ProcessingError("No readable text was found in this PDF.", 422);
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

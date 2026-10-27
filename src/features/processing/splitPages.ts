import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;

/**
 * Splits each page into overlapping chunks of about 1000 characters. Chunks
 * never cross pages, so every chunk keeps exactly one page number in its
 * metadata. Whitespace is normalized first and the splitter only drops spaces,
 * so a chunk stays a contiguous piece of the page text (the PDF viewer relies
 * on that to highlight it).
 */
export async function splitPages(pages: string[]): Promise<Document[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const pageDocuments = pages
    .map((text, i) => new Document({ pageContent: text.replace(/\s+/g, " ").trim(), metadata: { page: i + 1 } }))
    .filter((doc) => doc.pageContent.length > 0);

  const chunks = await splitter.splitDocuments(pageDocuments);
  return chunks.map(
    (chunk, i) =>
      new Document({ pageContent: chunk.pageContent, metadata: { page: chunk.metadata.page, chunkIndex: i } }),
  );
}

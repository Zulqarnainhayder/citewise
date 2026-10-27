export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;

/**
 * Splits one page of text into overlapping chunks of about `size` characters,
 * preferring to cut at the end of a sentence, then at a space. Chunks never
 * cross pages, so every chunk maps to exactly one page number.
 */
export function chunkText(
  text: string,
  size = CHUNK_SIZE,
  overlap = CHUNK_OVERLAP,
): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= size) return [clean];

  const minCut = Math.floor(size * 0.6);
  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);

    if (end < clean.length) {
      const window = clean.slice(start, end);
      const sentenceEnd = Math.max(
        window.lastIndexOf(". "),
        window.lastIndexOf("? "),
        window.lastIndexOf("! "),
      );
      const lastSpace = window.lastIndexOf(" ");
      if (sentenceEnd >= minCut) end = start + sentenceEnd + 1;
      else if (lastSpace >= minCut) end = start + lastSpace;
    }

    const chunk = clean.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= clean.length) break;

    // Step back for the overlap, then forward to the next word boundary.
    start = Math.max(end - overlap, start + 1);
    const nextSpace = clean.indexOf(" ", start);
    if (nextSpace !== -1 && nextSpace < end) start = nextSpace + 1;
  }

  return chunks;
}

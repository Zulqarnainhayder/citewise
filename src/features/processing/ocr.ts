import { HumanMessage } from "@langchain/core/messages";
import { createChatModel } from "@/lib/langchain/models";

/** A page with fewer readable characters than this is treated as an image. */
const MIN_PAGE_CHARS = 20;
/** Most scanned pages read in one request, so it fits the time limit and AI quota. */
export const OCR_MAX_PAGES = 15;
const OCR_TIMEOUT_MS = 45_000;

/** 1-based numbers of the pages that have no usable text layer (scans, images). */
export function findBlankPages(pages: string[]): number[] {
  const blank: number[] = [];
  pages.forEach((text, i) => {
    if (text.replace(/\s+/g, "").length < MIN_PAGE_CHARS) blank.push(i + 1);
  });
  return blank;
}

/** Whether to read this many blank pages with OCR. More than the cap are left alone. */
export function shouldOcr(blankCount: number): boolean {
  return blankCount > 0 && blankCount <= OCR_MAX_PAGES;
}

const MARKER = /^=== PAGE (\d+) ===\s*$/gm;

/** Splits the model's "=== PAGE n ===" transcript into text per requested page. */
export function parseTranscript(transcript: string, wanted: number[]): Map<number, string> {
  const result = new Map<number, string>();
  const marks = [...transcript.matchAll(MARKER)];
  marks.forEach((mark, i) => {
    const page = Number(mark[1]);
    if (!wanted.includes(page)) return;
    const start = (mark.index ?? 0) + mark[0].length;
    const end = marks[i + 1]?.index ?? transcript.length;
    const text = transcript.slice(start, end).trim();
    if (text) result.set(page, text);
  });
  return result;
}

/**
 * Reads text from scanned pages with Gemini's PDF understanding. Sends the whole file once
 * and asks for the listed pages only. Returns the text per page number.
 */
export async function ocrPages(data: ArrayBuffer, pages: number[]): Promise<Map<number, string>> {
  const model = createChatModel({ temperature: 0 });
  const message = new HumanMessage({
    content: [
      {
        type: "text",
        text:
          `Transcribe the text on page${pages.length === 1 ? "" : "s"} ${pages.join(", ")} of this PDF. ` +
          "For each page, output a line exactly like `=== PAGE 3 ===` followed by that page's text in reading order. " +
          "Copy the text exactly as printed, including numbers, in the original language. " +
          "Do not describe images, translate, summarize or add commentary. " +
          "If a page has no text, output its marker and nothing after it.",
      },
      { type: "media", mimeType: "application/pdf", data: Buffer.from(data).toString("base64") },
    ],
  });

  const response = await model.invoke([message], { signal: AbortSignal.timeout(OCR_TIMEOUT_MS) });
  const transcript =
    typeof response.content === "string"
      ? response.content
      : response.content.map((part) => ("text" in part ? part.text : "")).join("");
  return parseTranscript(transcript, pages);
}

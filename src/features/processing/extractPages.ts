import { extractText, getDocumentProxy } from "unpdf";
import { ProcessingError } from "./errors";

/** Returns the text of each page, in order (index 0 is page 1). */
export async function extractPages(data: ArrayBuffer): Promise<string[]> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(data));
    const { text } = await extractText(pdf, { mergePages: false });
    return text;
  } catch {
    throw new ProcessingError("This file could not be read as a PDF.", 422);
  }
}

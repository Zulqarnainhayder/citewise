import { CHAT_MODEL, getGemini } from "@/lib/gemini";
import { titleFrom } from "./persist";

const INSTRUCTION =
  "Write a short title (3 to 6 words, no quotes, no trailing punctuation) for this conversation about the user's documents. Use the language of the question. Reply with the title only.";
const TIMEOUT_MS = 8000;
const MAX_TITLE_CHARS = 60;

/** A short descriptive chat title. Falls back to the question if the model is slow or fails. */
export async function generateTitle(
  question: string,
  answer: string,
  documentTitles: string[],
): Promise<string> {
  try {
    const response = await Promise.race([
      getGemini().models.generateContent({
        model: CHAT_MODEL,
        contents: `${INSTRUCTION}\n\nDocuments: ${documentTitles.join(", ") || "none"}\nQuestion: ${question}\nAnswer: ${answer.slice(0, 600)}`,
        config: { temperature: 0.3, maxOutputTokens: 100 },
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)),
    ]);

    const title = (response.text ?? "")
      .replace(/["“”\n]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[.!]+$/, "");
    return title ? title.slice(0, MAX_TITLE_CHARS) : titleFrom(question);
  } catch {
    return titleFrom(question);
  }
}

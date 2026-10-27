import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { RunnableConfig } from "@langchain/core/runnables";
import { createChatModel } from "@/lib/langchain/models";
import { titleFrom } from "../persist";
import type { ChatGraphState } from "./state";

const titlePrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "Write a short title (3 to 6 words, no quotes, no trailing punctuation) for this conversation about the user's documents. Use the language of the question. Reply with the title only.",
  ],
  ["human", "Documents: {documents}\nQuestion: {question}\nAnswer: {answer}"],
]);

const TIMEOUT_MS = 8000;
const MAX_TITLE_CHARS = 60;

/** Graph node: a short descriptive chat title, falling back to the question if the model is slow or fails. */
export async function titleNode(
  state: ChatGraphState,
  config: RunnableConfig,
): Promise<Partial<ChatGraphState>> {
  try {
    const documents = [...new Set(state.sources.map((s) => s.title))].join(", ") || "none";
    const text = await titlePrompt
      .pipe(createChatModel({ temperature: 0.3, maxOutputTokens: 100 }))
      .pipe(new StringOutputParser())
      .invoke(
        { documents, question: state.question, answer: state.answer.slice(0, 600) },
        { ...config, signal: AbortSignal.timeout(TIMEOUT_MS) },
      );

    const title = text.replace(/["“”\n]/g, " ").replace(/\s+/g, " ").trim().replace(/[.!]+$/, "");
    return { title: title ? title.slice(0, MAX_TITLE_CHARS) : titleFrom(state.question) };
  } catch {
    return { title: titleFrom(state.question) };
  }
}

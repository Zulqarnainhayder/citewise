import { CHAT_MODEL, getGemini } from "@/lib/gemini";
import type { ChatTurn, Source } from "../types";
import { buildPrompt } from "./prompt";

/** Yields the answer text piece by piece as the model writes it. */
export async function* streamAnswer(
  question: string,
  sources: Source[],
  history: ChatTurn[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const { systemInstruction, contents } = buildPrompt(question, sources, history);

  const stream = await getGemini().models.generateContentStream({
    model: CHAT_MODEL,
    contents,
    config: { systemInstruction, temperature: 0.2, abortSignal: signal },
  });

  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}

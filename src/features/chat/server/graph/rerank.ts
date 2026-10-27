import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { Document } from "@langchain/core/documents";
import { createChatModel } from "@/lib/langchain/models";

/** A keyword-only match scoring below this (out of 10) does not help answer the question. */
export const MIN_RELEVANCE = 4;
const TIMEOUT_MS = 6000;

const INSTRUCTION =
  "You rate how useful each numbered passage is for answering a question. " +
  "Score each from 0 (unrelated) to 10 (directly answers it). " +
  "Reply with only a JSON array of integers, one per passage, in order. No other text.";

/** Reads the model's reply as one score per passage, or null when it is not in the expected shape. */
export function parseScores(reply: string, expected: number): number[] | null {
  const match = reply.match(/\[[\s\d.,-]*\]/);
  if (!match) return null;
  try {
    const parsed: unknown = JSON.parse(match[0]);
    if (!Array.isArray(parsed) || parsed.length !== expected) return null;
    if (!parsed.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
    return (parsed as number[]).map((n) => Math.min(10, Math.max(0, n)));
  } catch {
    return null;
  }
}

/**
 * Sorts by score (highest first); ties keep their order. Passages that search by meaning already
 * judged relevant are never dropped. Only the others (keyword matches) must reach the relevance bar.
 */
export function applyScores(docs: Document[], scores: number[], isProtected: (doc: Document) => boolean): Document[] {
  return docs
    .map((doc, index) => ({ doc, score: scores[index], index }))
    .filter((entry) => entry.score >= MIN_RELEVANCE || isProtected(entry.doc))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.doc);
}

/**
 * Re-orders candidate passages with the chat model, which reads the question and each passage
 * together (search alone compares them separately). Returns null if the model is slow, busy or
 * answers in the wrong shape, so the caller can keep the original order.
 */
export async function rerank(
  question: string,
  candidates: Document[],
  isProtected: (doc: Document) => boolean,
): Promise<Document[] | null> {
  if (candidates.length === 0) return [];
  try {
    const passages = candidates
      .map((doc, i) => `[${i + 1}] ${doc.pageContent}`)
      .join("\n\n");
    const reply = await createChatModel({ temperature: 0, maxOutputTokens: 120 }).invoke(
      [new SystemMessage(INSTRUCTION), new HumanMessage(`Question: ${question}\n\nPassages:\n${passages}`)],
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    const text =
      typeof reply.content === "string"
        ? reply.content
        : reply.content.map((part) => ("text" in part ? part.text : "")).join("");
    const scores = parseScores(text, candidates.length);
    return scores ? applyScores(candidates, scores, isProtected) : null;
  } catch {
    return null;
  }
}

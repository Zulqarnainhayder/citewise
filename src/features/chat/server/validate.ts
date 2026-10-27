import type { ChatRequest } from "../types";

const MAX_QUESTION_CHARS = 2000;
const MAX_DOCUMENTS = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A problem with the request itself; the message is safe to show. */
export class ChatRequestError extends Error {}

export function parseChatRequest(body: unknown): ChatRequest {
  const { question, chatId, documentIds } = (body ?? {}) as Record<string, unknown>;

  if (typeof question !== "string" || !question.trim()) {
    throw new ChatRequestError("Please type a question.");
  }
  if (question.length > MAX_QUESTION_CHARS) {
    throw new ChatRequestError(`Questions can be up to ${MAX_QUESTION_CHARS} characters.`);
  }

  if (chatId !== undefined && (typeof chatId !== "string" || !UUID.test(chatId))) {
    throw new ChatRequestError("Invalid chat.");
  }

  let ids: string[] | undefined;
  if (documentIds !== undefined) {
    if (
      !Array.isArray(documentIds) ||
      documentIds.length > MAX_DOCUMENTS ||
      !documentIds.every((id) => typeof id === "string" && UUID.test(id))
    ) {
      throw new ChatRequestError("Invalid document selection.");
    }
    ids = documentIds;
  }

  return { question: question.trim(), chatId, documentIds: ids };
}

import { TaskType } from "@google/generative-ai";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

/** Chat model that writes answers. Override with GEMINI_CHAT_MODEL. */
export const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL ?? "gemini-3.5-flash-lite";
export const EMBEDDING_MODEL = "gemini-embedding-001";
/** Must match the vector(768) column in the chunks table. */
export const EMBEDDING_DIMENSIONS = 768;

function apiKey() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GOOGLE_API_KEY is not set.");
  return key;
}

/** Embeddings for storing document chunks ("document") or searching them ("query"). */
export function createEmbeddings(purpose: "document" | "query") {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: apiKey(),
    model: EMBEDDING_MODEL,
    taskType: purpose === "query" ? TaskType.RETRIEVAL_QUERY : TaskType.RETRIEVAL_DOCUMENT,
    outputDimensionality: EMBEDDING_DIMENSIONS,
    maxRetries: 3,
  });
}

/** The Gemini chat model, streaming by default. */
export function createChatModel(options: { temperature?: number; maxOutputTokens?: number } = {}) {
  return new ChatGoogleGenerativeAI({
    apiKey: apiKey(),
    model: CHAT_MODEL,
    temperature: options.temperature ?? 0.2,
    maxOutputTokens: options.maxOutputTokens,
    streaming: true,
    maxRetries: 2,
  });
}

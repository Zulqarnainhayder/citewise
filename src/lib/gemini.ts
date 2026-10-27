import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

/** Shared server-side Gemini client. The key never reaches the browser. */
export function getGemini() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not set.");
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

/** Chat model used to write answers. Override with GEMINI_CHAT_MODEL. */
export const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL ?? "gemini-3.5-flash-lite";

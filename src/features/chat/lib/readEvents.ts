import type { ChatEvent } from "../types";

/** Reads the newline-delimited JSON stream from /api/chat, one event at a time. */
export async function* readEvents(response: Response): AsyncGenerator<ChatEvent> {
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline: number;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) yield JSON.parse(line) as ChatEvent;
    }
  }

  const rest = buffer.trim();
  if (rest) yield JSON.parse(rest) as ChatEvent;
}

import { describe, expect, it } from "vitest";
import { ChatRequestError, parseChatRequest } from "./validate";

const uuid = "123e4567-e89b-42d3-a456-426614174000";

describe("parseChatRequest", () => {
  it("accepts a question and trims it", () => {
    expect(parseChatRequest({ question: "  How long?  " })).toEqual({
      question: "How long?",
      chatId: undefined,
      documentIds: undefined,
    });
  });

  it("accepts a chat id and document ids", () => {
    const request = parseChatRequest({ question: "x", chatId: uuid, documentIds: [uuid] });
    expect(request.chatId).toBe(uuid);
    expect(request.documentIds).toEqual([uuid]);
  });

  it("rejects a missing, blank or oversized question", () => {
    expect(() => parseChatRequest({})).toThrow(ChatRequestError);
    expect(() => parseChatRequest({ question: "   " })).toThrow("Please type a question.");
    expect(() => parseChatRequest({ question: "x".repeat(2001) })).toThrow(ChatRequestError);
    expect(() => parseChatRequest(null)).toThrow(ChatRequestError);
  });

  it("rejects a malformed chat id", () => {
    expect(() => parseChatRequest({ question: "x", chatId: "not-a-uuid" })).toThrow("Invalid chat.");
  });

  it("rejects bad document selections", () => {
    expect(() => parseChatRequest({ question: "x", documentIds: ["nope"] })).toThrow("Invalid document selection.");
    expect(() => parseChatRequest({ question: "x", documentIds: "all" })).toThrow(ChatRequestError);
    expect(() => parseChatRequest({ question: "x", documentIds: Array(21).fill(uuid) })).toThrow(ChatRequestError);
  });
});

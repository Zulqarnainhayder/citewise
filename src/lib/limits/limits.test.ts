import { describe, expect, it } from "vitest";
import { evaluateChatLimit, evaluateDocumentLimit } from "./limits";

const limits = { chatPerMinute: 6, chatPerDay: 50 };

describe("evaluateChatLimit", () => {
  it("allows a user who is well under both limits", () => {
    expect(evaluateChatLimit(0, 0, limits)).toEqual({ allowed: true });
    expect(evaluateChatLimit(5, 49, limits)).toEqual({ allowed: true });
  });

  it("blocks a burst of questions in one minute", () => {
    const result = evaluateChatLimit(6, 6, limits);
    expect(result).toMatchObject({ allowed: false, retryAfterSeconds: 30 });
    expect(result.allowed === false && result.message).toMatch(/too quickly/);
  });

  it("blocks once the daily limit is reached", () => {
    const result = evaluateChatLimit(0, 50, limits);
    expect(result).toMatchObject({ allowed: false, retryAfterSeconds: 3600 });
    expect(result.allowed === false && result.message).toMatch(/limit of 50 questions/);
  });

  it("reports the daily limit first when both are exceeded", () => {
    const result = evaluateChatLimit(9, 80, limits);
    expect(result.allowed === false && result.message).toMatch(/today's limit/);
  });
});

describe("evaluateDocumentLimit", () => {
  const docs = { documentsPerDay: 10 };

  it("allows up to the daily number of new documents, counting the current one", () => {
    expect(evaluateDocumentLimit(10, docs)).toEqual({ allowed: true });
  });

  it("blocks the document after the limit", () => {
    const result = evaluateDocumentLimit(11, docs);
    expect(result).toMatchObject({ allowed: false });
    expect(result.allowed === false && result.message).toMatch(/10 new documents per day/);
  });
});

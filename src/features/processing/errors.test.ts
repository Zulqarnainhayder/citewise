import { describe, expect, it } from "vitest";
import { ProcessingError, toProcessingError } from "./errors";

describe("toProcessingError", () => {
  it("turns rate-limit failures into a friendly 429", () => {
    const result = toProcessingError(new Error("[429 Too Many Requests] quota exceeded"));
    expect(result).toBeInstanceOf(ProcessingError);
    expect((result as ProcessingError).status).toBe(429);
    expect((result as ProcessingError).message).toMatch(/rate-limited/);
  });

  it("leaves a ProcessingError unchanged", () => {
    const original = new ProcessingError("No readable text.", 422);
    expect(toProcessingError(original)).toBe(original);
  });

  it("returns other errors untouched", () => {
    const other = new Error("disk on fire");
    expect(toProcessingError(other)).toBe(other);
  });
});

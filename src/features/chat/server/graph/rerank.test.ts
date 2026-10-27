import { Document } from "@langchain/core/documents";
import { describe, expect, it } from "vitest";
import { MIN_RELEVANCE, applyScores, parseScores } from "./rerank";

const docs = ["a", "b", "c", "d"].map((pageContent) => new Document({ pageContent }));

describe("parseScores", () => {
  it("reads a plain JSON array", () => {
    expect(parseScores("[9, 2, 7, 0]", 4)).toEqual([9, 2, 7, 0]);
  });

  it("finds the array inside code fences or chatter", () => {
    expect(parseScores("```json\n[1,2,3]\n```", 3)).toEqual([1, 2, 3]);
    expect(parseScores("Scores: [5, 6]", 2)).toEqual([5, 6]);
  });

  it("clamps out-of-range scores", () => {
    expect(parseScores("[15, -3]", 2)).toEqual([10, 0]);
  });

  it("rejects the wrong length or shape", () => {
    expect(parseScores("[1, 2]", 3)).toBeNull();
    expect(parseScores("no array here", 1)).toBeNull();
    expect(parseScores('["a", "b"]', 2)).toBeNull();
  });
});

describe("applyScores", () => {
  const never = () => false;

  it("orders by score and drops low-scoring passages", () => {
    const result = applyScores(docs, [3, 9, 5, 7], never);
    expect(result.map((d) => d.pageContent)).toEqual(["b", "d", "c"]);
  });

  it("keeps the original order for ties", () => {
    const result = applyScores(docs, [6, 6, 6, 6], never);
    expect(result.map((d) => d.pageContent)).toEqual(["a", "b", "c", "d"]);
  });

  it("can drop everything when nothing is relevant", () => {
    expect(applyScores(docs, [0, 1, 2, MIN_RELEVANCE - 1], never)).toEqual([]);
  });

  it("never drops a protected passage, but still ranks it by score", () => {
    const protectedA = (doc: Document) => doc.pageContent === "a";
    const result = applyScores(docs, [0, 9, 1, 8], protectedA);
    expect(result.map((d) => d.pageContent)).toEqual(["b", "d", "a"]);
  });
});

import { describe, expect, it } from "vitest";
import { reciprocalRankFusion } from "./fusion";

const id = (s: string) => s;

describe("reciprocalRankFusion", () => {
  it("ranks an item found by both lists above items found by one", () => {
    expect(reciprocalRankFusion([["a", "b", "c"], ["d", "b", "e"]], id)[0]).toBe("b");
  });

  it("keeps every item once", () => {
    const fused = reciprocalRankFusion([["a", "b"], ["b", "c"]], id);
    expect([...fused].sort()).toEqual(["a", "b", "c"]);
  });

  it("works with one list and with none", () => {
    expect(reciprocalRankFusion([["a", "b"]], id)).toEqual(["a", "b"]);
    expect(reciprocalRankFusion([], id)).toEqual([]);
  });

  it("lets a keyword-only hit in at rank 1 compete with a vector-only hit at rank 1", () => {
    const fused = reciprocalRankFusion([["v1", "v2"], ["k1"]], id);
    expect(fused.slice(0, 2)).toEqual(["v1", "k1"]);
  });
});

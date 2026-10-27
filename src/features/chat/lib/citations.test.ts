import { describe, expect, it } from "vitest";
import { citedNumbers, linkCitations } from "./citations";

describe("citedNumbers", () => {
  it("reads single, grouped and ranged citations", () => {
    expect([...citedNumbers("A [1] and [3].")]).toEqual([1, 3]);
    expect([...citedNumbers("Grouped [1, 6] and [2,3].")].sort()).toEqual([1, 2, 3, 6]);
    expect([...citedNumbers("Range [2-4] and [5–6].")].sort()).toEqual([2, 3, 4, 5, 6]);
  });

  it("ignores things that are not citations", () => {
    expect(citedNumbers("No citations, just [x] and [ ] and 12.").size).toBe(0);
  });

  it("does not expand an unreasonably large range", () => {
    expect([...citedNumbers("Huge range [1-99].")]).toEqual([1, 99]);
  });
});

describe("linkCitations", () => {
  it("turns each citation into its own markdown link", () => {
    expect(linkCitations("Plain [1].", "cite:")).toBe("Plain [1](cite:1).");
    expect(linkCitations("Grouped [1, 6].", "cite:")).toBe("Grouped [1](cite:1)[6](cite:6).");
  });

  it("leaves other bracketed text alone", () => {
    expect(linkCitations("Keep [x] as it is.", "cite:")).toBe("Keep [x] as it is.");
  });
});

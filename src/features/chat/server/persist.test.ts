import { describe, expect, it } from "vitest";
import { titleFrom } from "./persist";

describe("titleFrom", () => {
  it("uses a short question as the title", () => {
    expect(titleFrom("How long is the notice period?")).toBe("How long is the notice period?");
  });

  it("collapses whitespace and line breaks", () => {
    expect(titleFrom("  Summarize\n\n the   contract  ")).toBe("Summarize the contract");
  });

  it("shortens a long question to 60 characters with an ellipsis", () => {
    const title = titleFrom("word ".repeat(40));
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith("…")).toBe(true);
  });
});

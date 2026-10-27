import { describe, expect, it } from "vitest";
import { OCR_MAX_PAGES, findBlankPages, parseTranscript, shouldOcr } from "./ocr";

describe("findBlankPages", () => {
  it("returns 1-based numbers of pages without real text", () => {
    expect(findBlankPages(["A full page of readable text.", "   \n ", "7", "More readable text here, enough."])).toEqual([2, 3]);
  });

  it("returns nothing when every page has text", () => {
    expect(findBlankPages(["Some actual sentence here."])).toEqual([]);
  });
});

describe("shouldOcr", () => {
  it("skips documents with no blank pages", () => {
    expect(shouldOcr(0)).toBe(false);
  });

  it("reads blank pages up to the cap", () => {
    expect(shouldOcr(OCR_MAX_PAGES)).toBe(true);
  });

  it("does not read more than the cap", () => {
    expect(shouldOcr(OCR_MAX_PAGES + 1)).toBe(false);
  });
});

describe("parseTranscript", () => {
  it("splits the transcript by page marker", () => {
    const text = "=== PAGE 2 ===\nHello world\nsecond line\n=== PAGE 5 ===\nGoodbye";
    const parsed = parseTranscript(text, [2, 5]);
    expect(parsed.get(2)).toBe("Hello world\nsecond line");
    expect(parsed.get(5)).toBe("Goodbye");
  });

  it("ignores pages that were not requested", () => {
    const parsed = parseTranscript("=== PAGE 1 ===\nA\n=== PAGE 2 ===\nB", [2]);
    expect([...parsed.keys()]).toEqual([2]);
  });

  it("leaves out pages with no text", () => {
    const parsed = parseTranscript("=== PAGE 1 ===\n=== PAGE 2 ===\nB", [1, 2]);
    expect(parsed.has(1)).toBe(false);
    expect(parsed.get(2)).toBe("B");
  });

  it("returns nothing when the model ignored the format", () => {
    expect(parseTranscript("Sure! Here is the text.", [1]).size).toBe(0);
  });
});

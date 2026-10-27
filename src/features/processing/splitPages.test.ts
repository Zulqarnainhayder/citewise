import { describe, expect, it } from "vitest";
import { splitPages } from "./splitPages";

const squeeze = (text: string) => text.replace(/\s+/g, "");
const sentence = "This agreement may be terminated by either party with thirty days written notice. ";

describe("splitPages", () => {
  const pages = [
    "  Short   page \n with   odd\twhitespace.  ",
    sentence.repeat(45),
    "   ",
    "x".repeat(2600),
  ];

  it("keeps the original page numbers and skips empty pages", async () => {
    const chunks = await splitPages(pages);
    expect([...new Set(chunks.map((c) => c.metadata.page))]).toEqual([1, 2, 4]);
  });

  it("numbers the chunks in order", async () => {
    const chunks = await splitPages(pages);
    expect(chunks.map((c) => c.metadata.chunkIndex)).toEqual(chunks.map((_, i) => i));
  });

  it("keeps chunks at or under 1000 characters and normalizes whitespace", async () => {
    const chunks = await splitPages(pages);
    expect(Math.max(...chunks.map((c) => c.pageContent.length))).toBeLessThanOrEqual(1000);
    expect(chunks[0].pageContent).toBe("Short page with odd whitespace.");
  });

  it("makes every chunk a contiguous piece of its own page (the PDF viewer relies on this)", async () => {
    const chunks = await splitPages(pages);
    for (const chunk of chunks) {
      const page = squeeze(pages[chunk.metadata.page - 1]);
      expect(page).toContain(squeeze(chunk.pageContent));
    }
  });

  it("overlaps neighbouring chunks so context is not lost at the edges", async () => {
    const chunks = (await splitPages(pages)).filter((c) => c.metadata.page === 2);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.slice(1).forEach((chunk, i) => {
      expect(squeeze(chunks[i].pageContent)).toContain(squeeze(chunk.pageContent).slice(0, 60));
    });
  });

  it("still splits a long text without spaces", async () => {
    const chunks = (await splitPages(pages)).filter((c) => c.metadata.page === 4);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
  });

  it("returns nothing for no pages", async () => {
    expect(await splitPages([])).toEqual([]);
  });
});

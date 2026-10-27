import { describe, expect, it } from "vitest";
import type { Source } from "../types";
import { NOT_FOUND, SYSTEM_INSTRUCTION, answerPrompt, formatExcerpts } from "./prompt";

const sources: Source[] = [
  { n: 1, documentId: "d1", title: "Contract", page: 2, snippet: "Thirty days notice." },
  { n: 2, documentId: "d2", title: "Resume", page: 1, snippet: "Intern at Acme." },
];

describe("formatExcerpts", () => {
  it("numbers each excerpt with its document and page", () => {
    expect(formatExcerpts(sources)).toBe(
      "[1] Contract, page 2:\nThirty days notice.\n\n[2] Resume, page 1:\nIntern at Acme.",
    );
  });

  it("says so when nothing was found", () => {
    expect(formatExcerpts([])).toBe("No excerpts were found for this question.");
  });
});

describe("system instruction", () => {
  it("tells the model to answer only from excerpts and to say when it cannot", () => {
    expect(SYSTEM_INSTRUCTION).toContain("ONLY the numbered excerpts");
    expect(SYSTEM_INSTRUCTION).toContain(NOT_FOUND);
  });

  it("asks for separate citations and for naming documents", () => {
    expect(SYSTEM_INSTRUCTION).toMatch(/own brackets/);
    expect(SYSTEM_INSTRUCTION).toMatch(/keep the documents separate/);
  });
});

describe("answerPrompt", () => {
  it("builds system, history and the excerpts + question", async () => {
    const messages = await answerPrompt.formatMessages({
      history: [],
      excerpts: formatExcerpts(sources),
      question: "How long is the notice?",
    });
    expect(messages).toHaveLength(2);
    expect(String(messages[0].content)).toContain("You are CiteWise");
    expect(String(messages[1].content)).toContain("[1] Contract, page 2:");
    expect(String(messages[1].content)).toContain("Question: How long is the notice?");
  });
});

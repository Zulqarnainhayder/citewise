import { describe, expect, it } from "vitest";
import { extractKeywordTerms } from "./keywordTerms";

describe("extractKeywordTerms", () => {
  it("drops stop words and short words", () => {
    expect(extractKeywordTerms("How long is the notice period for termination?")).toEqual([
      "long",
      "notice",
      "period",
      "termination",
    ]);
  });

  it("keeps identifiers and email addresses whole", () => {
    expect(extractKeywordTerms("What does invoice INV-2026-0417 say? Mail claims@zeta.example.")).toEqual([
      "invoice",
      "inv-2026-0417",
      "inv",
      "2026",
      "0417",
      "say",
      "mail",
      "claims@zeta.example",
    ]);
  });

  it("also searches the parts of a hyphenated code", () => {
    expect(extractKeywordTerms("What does schedule SCH-7B cover?")).toEqual([
      "schedule",
      "sch-7b",
      "sch",
      "7b",
      "cover",
    ]);
  });

  it("handles German", () => {
    expect(extractKeywordTerms("Wie viele Urlaubstage haben die Mitarbeiter?")).toEqual([
      "urlaubstage",
      "mitarbeiter",
    ]);
  });

  it("removes duplicates and caps the list", () => {
    expect(extractKeywordTerms("alpha alpha ALPHA")).toEqual(["alpha"]);
    const many = Array.from({ length: 30 }, (_, i) => `word${i}`).join(" ");
    expect(extractKeywordTerms(many)).toHaveLength(12);
  });

  it("returns nothing for a question of only stop words", () => {
    expect(extractKeywordTerms("what is it?")).toEqual([]);
  });
});

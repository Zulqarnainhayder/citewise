import { describe, expect, it } from "vitest";
import { REFUSAL, citedNumbers, judge } from "./judge.mjs";

const docKeyById = { d1: "contract", d2: "vendor" };
const sources = [
  { n: 1, documentId: "d1", page: 2 },
  { n: 2, documentId: "d2", page: 2 },
  { n: 3, documentId: "d1", page: 3 },
];
const result = (answer, overrides = {}) => ({ answer, sources, error: null, ...overrides });

const notice = {
  type: "fact",
  answer: [["30", "thirty"]],
  cites: [{ doc: "contract", page: 2 }],
};

describe("answerable questions: a correct answer passes", () => {
  it("accepts the right fact with the right citation", () => {
    expect(judge(notice, result("The notice period is 30 days [1]."), docKeyById).pass).toBe(true);
  });

  it("accepts any synonym in a group, ignoring case and spacing", () => {
    expect(judge(notice, result("The   notice period is  THIRTY days [1]."), docKeyById).pass).toBe(true);
  });

  it("accepts grouped citations", () => {
    expect(judge(notice, result("It is 30 days [1, 3]."), docKeyById).pass).toBe(true);
  });
});

describe("answerable questions: wrong answers must fail", () => {
  it("rejects a wrong number", () => {
    const verdict = judge(notice, result("The notice period is 45 days [1]."), docKeyById);
    expect(verdict.pass).toBe(false);
    expect(verdict.answerOk).toBe(false);
  });

  it("rejects the right fact cited from the wrong page", () => {
    const verdict = judge(notice, result("The notice period is 30 days [3]."), docKeyById);
    expect(verdict.pass).toBe(false);
    expect(verdict.answerOk).toBe(true);
    expect(verdict.citationOk).toBe(false);
  });

  it("rejects the right fact cited from the wrong document", () => {
    expect(judge(notice, result("The notice period is 30 days [2]."), docKeyById).pass).toBe(false);
  });

  it("rejects the right fact with no citation", () => {
    expect(judge(notice, result("The notice period is 30 days."), docKeyById).pass).toBe(false);
  });

  it("flags when the search never returned the right page", () => {
    const verdict = judge(
      notice,
      result("The notice period is 30 days [1].", { sources: [{ n: 1, documentId: "d2", page: 2 }] }),
      docKeyById,
    );
    expect(verdict.retrievalOk).toBe(false);
    expect(verdict.pass).toBe(false);
  });

  it("requires every expected fact, not just one", () => {
    const both = {
      type: "multidoc",
      answer: [["30"], ["60"]],
      cites: [{ doc: "contract", page: 2 }, { doc: "vendor", page: 2 }],
    };
    expect(judge(both, result("It is 30 days [1]."), docKeyById).pass).toBe(false);
    expect(judge(both, result("It is 30 days [1] and 60 days [2]."), docKeyById).pass).toBe(true);
  });

  it("requires every expected citation", () => {
    const both = { type: "multidoc", answer: [["30"], ["60"]], cites: [{ doc: "contract", page: 2 }, { doc: "vendor", page: 2 }] };
    expect(judge(both, result("It is 30 days and 60 days [1]."), docKeyById).pass).toBe(false);
  });

  it("counts a refusal of an answerable question as a failure", () => {
    const verdict = judge(notice, result("I couldn't find that in your documents."), docKeyById);
    expect(verdict.pass).toBe(false);
    expect(verdict.refused).toBe(true);
  });

  it("fails an error with no answer", () => {
    expect(judge(notice, { answer: "", sources: [], error: "The AI service is busy." }, docKeyById).pass).toBe(false);
  });
});

describe("unanswerable questions", () => {
  const unanswerable = { type: "unanswerable" };

  it("passes a refusal, in English or German", () => {
    expect(judge(unanswerable, result("I couldn't find that in your documents."), docKeyById).pass).toBe(true);
    expect(judge(unanswerable, result("Das konnte ich in Ihren Dokumenten nicht finden."), docKeyById).pass).toBe(true);
  });

  it("fails a confident answer", () => {
    expect(judge(unanswerable, result("The capital of France is Paris."), docKeyById).pass).toBe(false);
  });

  it("fails when the model follows an injected instruction", () => {
    expect(judge(unanswerable, result("Why did the lawyer cross the road? To get to the other side."), docKeyById).pass).toBe(false);
  });
});

describe("small talk", () => {
  const smalltalk = { type: "smalltalk" };

  it("passes a friendly reply", () => {
    expect(judge(smalltalk, result("Hello! Ask me about your documents."), docKeyById).pass).toBe(true);
  });

  it("fails a refusal and an empty reply", () => {
    expect(judge(smalltalk, result("I couldn't find that in your documents."), docKeyById).pass).toBe(false);
    expect(judge(smalltalk, result(""), docKeyById).pass).toBe(false);
  });
});

describe("helpers", () => {
  it("reads single, grouped and ranged citations", () => {
    expect([...citedNumbers("A [1], B [2, 3], C [4-5].")].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("does not mistake a normal answer for a refusal", () => {
    expect(REFUSAL.test("The notice period is 30 days.")).toBe(false);
    expect(REFUSAL.test("Die Kündigungsfrist beträgt dreißig Tage.")).toBe(false);
  });
});

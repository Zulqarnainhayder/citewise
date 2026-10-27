import { describe, expect, it } from "vitest";
import { locateHighlight } from "./findHighlight";

const items = [
  "Service ",
  "Agreement",
  "Either party may ",
  "terminate this",
  " agreement with thirty",
  " (30) days written notice.",
  "Invoices are due",
  " within 14 days.",
].map((str) => ({ str }));

describe("locateHighlight", () => {
  it("finds a passage even when the text items split it differently", () => {
    const passage = "Either party may terminate this agreement with thirty (30) days written notice.";
    expect(locateHighlight(items, passage)).toEqual([2, 3, 4, 5]);
  });

  it("covers every item when the passage is the whole page", () => {
    const passage =
      "Service Agreement Either party may terminate this agreement with thirty (30) days written notice. Invoices are due within 14 days.";
    expect(locateHighlight(items, passage)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("finds a passage inside a single item", () => {
    expect(locateHighlight(items, "Invoices are due")).toEqual([6]);
  });

  it("anchors on the start when the tail of a long passage is not on the page", () => {
    const passage =
      "Either party may terminate this agreement with thirty (30) days written notice. " +
      "EXTRA TEXT THAT IS NOT ON THE PAGE AT ALL BUT LONG ENOUGH TO TRIGGER EDGE MATCHING " +
      "x".repeat(60);
    expect(locateHighlight(items, passage).slice(0, 4)).toEqual([2, 3, 4, 5]);
  });

  it("returns nothing when the passage is not on the page", () => {
    expect(
      locateHighlight(items, "Completely unrelated sentence about something else entirely, nothing in common."),
    ).toEqual([]);
  });

  it("returns nothing for an empty passage or an empty page", () => {
    expect(locateHighlight(items, "   ")).toEqual([]);
    expect(locateHighlight([], "anything")).toEqual([]);
  });
});

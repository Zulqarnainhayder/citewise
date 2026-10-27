import { describe, expect, it } from "vitest";
import { contentText } from "./text";

describe("contentText", () => {
  it("returns a string as is", () => {
    expect(contentText("hello")).toBe("hello");
  });

  it("joins the text parts of a list", () => {
    expect(contentText([{ type: "text", text: "Hel" }, "lo", { type: "image" }])).toBe("Hello");
  });

  it("returns an empty string for anything else", () => {
    expect(contentText(undefined)).toBe("");
    expect(contentText(42)).toBe("");
  });
});

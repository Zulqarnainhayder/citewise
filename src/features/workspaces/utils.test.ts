import { describe, expect, it } from "vitest";
import { MAX_WORKSPACE_NAME, validateWorkspaceName } from "./utils";

describe("validateWorkspaceName", () => {
  it("trims and squeezes whitespace", () => {
    expect(validateWorkspaceName("  Tax   2025 ", [])).toEqual({ ok: true, name: "Tax 2025" });
  });

  it("rejects an empty name", () => {
    expect(validateWorkspaceName("   ", [])).toMatchObject({ ok: false });
  });

  it("rejects a name that is too long", () => {
    expect(validateWorkspaceName("x".repeat(MAX_WORKSPACE_NAME + 1), [])).toMatchObject({ ok: false });
    expect(validateWorkspaceName("x".repeat(MAX_WORKSPACE_NAME), [])).toMatchObject({ ok: true });
  });

  it("rejects a duplicate regardless of case", () => {
    expect(validateWorkspaceName("research", ["Research"])).toMatchObject({ ok: false });
  });
});

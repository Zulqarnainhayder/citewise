import { describe, expect, it } from "vitest";
import { MAX_FILE_BYTES } from "./constants";
import { formatDate, titleFromFileName, validateFile } from "./utils";

const pdf = (name = "a.pdf", size = 10, type = "application/pdf") =>
  new File([new Uint8Array(size)], name, { type });

describe("validateFile", () => {
  it("accepts a normal PDF", () => {
    expect(validateFile(pdf())).toBeNull();
  });

  it("accepts a .pdf file even when the browser gives no type", () => {
    expect(validateFile(pdf("scan.PDF", 10, ""))).toBeNull();
  });

  it("rejects other file types", () => {
    expect(validateFile(pdf("notes.txt", 10, "text/plain"))).toBe("Only PDF files are supported.");
  });

  it("rejects empty and oversized files", () => {
    expect(validateFile(pdf("a.pdf", 0))).toBe("File is empty.");
    expect(validateFile(pdf("a.pdf", MAX_FILE_BYTES + 1))).toBe("File is larger than 10 MB.");
    expect(validateFile(pdf("a.pdf", MAX_FILE_BYTES))).toBeNull();
  });
});

describe("titleFromFileName", () => {
  it("removes the .pdf extension in any case", () => {
    expect(titleFromFileName("Contract.pdf")).toBe("Contract");
    expect(titleFromFileName("Contract.PDF")).toBe("Contract");
    expect(titleFromFileName("report.final.pdf")).toBe("report.final");
  });
});

describe("formatDate", () => {
  it("formats an ISO date as day, month and year", () => {
    expect(formatDate("2026-10-27T10:00:00.000Z")).toMatch(/2026/);
  });
});
